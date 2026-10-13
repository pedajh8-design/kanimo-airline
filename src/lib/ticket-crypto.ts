import crypto from 'crypto';

const SECRET_KEY = process.env.TICKET_SIGNING_SECRET || 'kanimo_ticket_hmac_sha256_cryptosecret_9988_verified';

export interface TicketSignatureData {
  ticketId: string;
  ticketNumber: string;
  flightId: string;
  flightNumber: string;
  passengerName: string;
  seatNumber: string;
}

export function generateTicketPayload(data: TicketSignatureData): { payload: string; securityHash: string } {
  const nonce = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  const rawString = `${data.ticketId}|${data.ticketNumber}|${data.flightNumber}|${data.passengerName}|${data.seatNumber}|${timestamp}|${nonce}`;
  
  const hmac = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawString)
    .digest('hex');

  const payload = `KANIMO:v1:${rawString}:${hmac.substring(0, 32)}`;
  return {
    payload,
    securityHash: hmac,
  };
}

export function verifyTicketPayload(payload: string): {
  isValid: boolean;
  ticketId?: string;
  ticketNumber?: string;
  flightNumber?: string;
  passengerName?: string;
  seatNumber?: string;
  timestamp?: number;
  error?: string;
} {
  try {
    if (!payload || !payload.startsWith('KANIMO:v1:')) {
      return { isValid: false, error: 'Invalid barcode/QR code format for Kanimo Airline' };
    }

    const parts = payload.split(':');
    if (parts.length !== 4) {
      return { isValid: false, error: 'Malformed ticket security payload structure' };
    }

    const rawString = parts[2];
    const signatureProvided = parts[3];

    const expectedHmac = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawString)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signatureProvided), Buffer.from(expectedHmac.substring(0, 32)))) {
      return { isValid: false, error: 'Cryptographic signature mismatch - ticket may be counterfeit' };
    }

    const [ticketId, ticketNumber, flightNumber, passengerName, seatNumber, timestampStr] = rawString.split('|');

    return {
      isValid: true,
      ticketId,
      ticketNumber,
      flightNumber,
      passengerName,
      seatNumber,
      timestamp: parseInt(timestampStr, 10),
    };
  } catch (err: any) {
    return { isValid: false, error: err.message || 'Verification exception' };
  }
}
