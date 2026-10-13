import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { verifyTicketPayload } from '@/lib/ticket-crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'STAFF' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Staff or Administrator clearance required to validate tickets' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { qrPayload, ticketNumber } = body;

    if (!qrPayload && !ticketNumber) {
      return NextResponse.json(
        { error: 'Please provide either a scannable QR payload or a Ticket Number' },
        { status: 400 }
      );
    }

    let resolvedTicketNumber = ticketNumber ? ticketNumber.trim() : null;
    let resolvedTicketId: string | null = null;

    // Cryptographic signature verification if QR payload was scanned
    if (qrPayload) {
      const verification = verifyTicketPayload(qrPayload);
      if (!verification.isValid) {
        return NextResponse.json(
          {
            error: `Security Check Failed: ${verification.error || 'Invalid or tampered boarding pass'}`,
            isTampered: true,
          },
          { status: 400 }
        );
      }
      resolvedTicketNumber = verification.ticketNumber || null;
      resolvedTicketId = verification.ticketId || null;
    }

    // Lookup ticket in database
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          ...(resolvedTicketId ? [{ id: resolvedTicketId }] : []),
          ...(resolvedTicketNumber ? [{ ticketNumber: resolvedTicketNumber }] : []),
        ],
      },
      include: {
        flight: true,
        ticketTier: true,
        user: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found in Kanimo Airline reservation database' },
        { status: 404 }
      );
    }

    // Single-entry reuse prevention
    if (ticket.status === 'CHECKED_IN' || ticket.status === 'BOARDED') {
      return NextResponse.json(
        {
          error: `Ticket already used! Boarding pass was validated on ${ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : 'earlier'}. Single-entry reuse is prevented.`,
          alreadyValidated: true,
          ticket,
        },
        { status: 409 }
      );
    }

    if (ticket.status === 'CANCELLED') {
      return NextResponse.json(
        {
          error: 'Ticket is invalid: Flight booking has been cancelled or refunded.',
          isCancelled: true,
          ticket,
        },
        { status: 400 }
      );
    }

    // Atomically transition status to CHECKED_IN
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedInByStaffId: session.id,
      },
      include: {
        flight: true,
        ticketTier: true,
      },
    });

    // Record audit event
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'TICKET_CHECKED_IN',
        entityType: 'TICKET',
        entityId: ticket.id,
        details: JSON.stringify({
          ticketNumber: ticket.ticketNumber,
          passengerName: ticket.passengerName,
          seatNumber: ticket.seatNumber,
          flightNumber: ticket.flight.flightNumber,
          verifiedBy: session.name,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Boarding pass valid and passenger checked in successfully',
      ticket: updatedTicket,
      passengerName: ticket.passengerName,
      seatNumber: ticket.seatNumber,
      flightNumber: ticket.flight.flightNumber,
      origin: ticket.flight.origin,
      destination: ticket.flight.destination,
      gate: ticket.flight.gate,
      terminal: ticket.flight.terminal,
      cabinClass: ticket.ticketTier.cabinClass,
      boardingGroup: ticket.boardingGroup,
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: error.message || 'Validation failed' }, { status: 500 });
  }
}
