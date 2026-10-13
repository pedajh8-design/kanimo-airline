import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTicketPayload } from '@/lib/ticket-crypto';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook secrets are not configured in environment variables' },
      { status: 501 }
    );
  }

  try {
    const bodyText = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-09-30.acacia' as any });

    let event;
    try {
      event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Idempotent processing of checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.client_reference_id || session.metadata?.orderId;
      const paymentIntentId = session.payment_intent || session.id;

      if (!orderId) {
        return NextResponse.json({ error: 'Missing orderId in session metadata' }, { status: 400 });
      }

      // Check if this payment event was already handled (idempotency check)
      const existingPayment = await prisma.payment.findUnique({
        where: { providerPaymentId: paymentIntentId },
      });

      if (existingPayment) {
        // Already processed, return 200 OK idempotently
        return NextResponse.json({ received: true, message: 'Event already processed' });
      }

      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            flight: true,
            items: { include: { ticketTier: true } },
          },
        });

        if (!order || order.status === 'PAID') return;

        // 1. Mark order as PAID
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PAID', paymentMethod: 'STRIPE' },
        });

        // 2. Transition reservedCount to soldCount
        for (const item of order.items) {
          await tx.ticketTier.update({
            where: { id: item.ticketTierId },
            data: {
              reservedCount: { decrement: 1 },
              soldCount: { increment: 1 },
            },
          });
        }

        // 3. Create Payment record
        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmount,
            currency: 'USD',
            provider: 'STRIPE',
            providerPaymentId: paymentIntentId,
            status: 'SUCCEEDED',
            cardLast4: '4242',
            cardBrand: 'Visa',
            receiptUrl: session.receipt_url || null,
            metadata: JSON.stringify(session),
          },
        });

        // 4. Issue Tickets with HMAC signatures
        for (const item of order.items) {
          const ticketId = crypto.randomUUID();
          const ticketNumber = `TKT-KN-${Math.floor(10000000 + Math.random() * 90000000)}`;

          const security = generateTicketPayload({
            ticketId,
            ticketNumber,
            flightId: order.flight.id,
            flightNumber: order.flight.flightNumber,
            passengerName: item.passengerName,
            seatNumber: item.seatNumber || '14A',
          });

          await tx.ticket.create({
            data: {
              id: ticketId,
              ticketNumber,
              orderId: order.id,
              orderItemId: item.id,
              flightId: order.flight.id,
              ticketTierId: item.ticketTierId,
              userId: order.userId,
              passengerName: item.passengerName,
              seatNumber: item.seatNumber || '14A',
              boardingGroup: item.ticketTier.cabinClass === 'FIRST' ? 'Group 1' : 'Group 3',
              qrSecurityPayload: security.payload,
              securityHash: security.securityHash,
              status: 'ISSUED',
            },
          });
        }

        // 5. Audit log
        await tx.auditLog.create({
          data: {
            userId: order.userId,
            action: 'PAYMENT_RECEIVED_STRIPE',
            entityType: 'ORDER',
            entityId: order.id,
            details: JSON.stringify({ paymentIntentId, amount: order.totalAmount }),
          },
        });
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook execution failed:', err);
    return NextResponse.json({ error: err.message || 'Webhook failed' }, { status: 500 });
  }
}
