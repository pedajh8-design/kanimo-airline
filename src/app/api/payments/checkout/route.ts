import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { flight: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isLiveStripeConfigured = Boolean(stripeSecretKey && stripeSecretKey.startsWith('sk_'));

    if (isLiveStripeConfigured) {
      // In production with live Stripe credentials:
      // Dynamically import stripe to avoid bundling if not used
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeSecretKey!, { apiVersion: '2024-09-30.acacia' as any });

      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const sessionCheckout = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Flight ${order.flight.flightNumber}: ${order.flight.originCode} → ${order.flight.destinationCode}`,
                description: `Kanimo Airline Passenger Reservation (${order.passengerCount} passenger/s)`,
              },
              unit_amount: Math.round(order.totalAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/orders/${order.id}?session_id={CHECKOUT_SESSION_ID}&payment_status=success`,
        cancel_url: `${origin}/orders/${order.id}?payment_status=cancelled`,
        client_reference_id: order.id,
        customer_email: order.contactEmail,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      } as any);

      return NextResponse.json({
        provider: 'STRIPE',
        checkoutUrl: sessionCheckout.url,
        sessionId: sessionCheckout.id,
      });
    }

    // Development/Demo Mode
    return NextResponse.json({
      provider: 'DEMO',
      demoMode: true,
      message: 'Demo payment mode active. Live card credentials are not configured.',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: 'USD',
      },
      instructions: 'Use the demo payment confirmation button or configure STRIPE_SECRET_KEY for live processing.',
    });
  } catch (error: any) {
    console.error('Payment checkout initiation error:', error);
    return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
  }
}
