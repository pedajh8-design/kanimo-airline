import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.TICKET_SIGNING_SECRET || 'kanimo_ticket_hmac_sha256_cryptosecret_9988_verified';

function generateTicketSecurity(data: {
  ticketId: string;
  ticketNumber: string;
  flightNumber: string;
  passengerName: string;
  seatNumber: string;
}) {
  const nonce = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now();
  const rawString = `${data.ticketId}|${data.ticketNumber}|${data.flightNumber}|${data.passengerName}|${data.seatNumber}|${timestamp}|${nonce}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(rawString).digest('hex');
  return {
    payload: `KANIMO:v1:${rawString}:${hmac.substring(0, 32)}`,
    securityHash: hmac,
  };
}

async function main() {
  console.log('--- Seeding Kanimo Airline Ticketing Database ---');

  // Clear existing records in proper dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.supportComment.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.ticketTier.deleteMany({});
  await prisma.flight.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashStaff = await bcrypt.hash('agent123', 10);
  const passwordHashCustomer = await bcrypt.hash('passenger123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@kanimo.com',
      password: passwordHashAdmin,
      name: 'Kanimo Operations Director',
      role: 'ADMIN',
      phone: '+1 (555) 019-2831',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'agent@kanimo.com',
      password: passwordHashStaff,
      name: 'Sarah Connor (Gate Agent)',
      role: 'STAFF',
      phone: '+1 (555) 019-4422',
    },
  });

  const passenger = await prisma.user.create({
    data: {
      email: 'passenger@example.com',
      password: passwordHashCustomer,
      name: 'Alexander Mitchell',
      role: 'CUSTOMER',
      phone: '+1 (555) 482-9912',
    },
  });

  const passenger2 = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      password: passwordHashCustomer,
      name: 'Maria Gonzalez',
      role: 'CUSTOMER',
      phone: '+1 (555) 991-3420',
    },
  });

  console.log('Created Users: Admin, Staff, and Customers');

  // 2. Create Flights
  const now = new Date();
  const flightsData = [
    {
      flightNumber: 'KN-101',
      airline: 'Kanimo Airline',
      aircraft: 'Boeing 787-9 Dreamliner',
      origin: 'New York (JFK)',
      originCode: 'JFK',
      originCity: 'New York',
      destination: 'London Heathrow (LHR)',
      destinationCode: 'LHR',
      destinationCity: 'London',
      departureTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +2 days
      arrivalTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 15 * 60 * 1000),
      duration: '7h 15m',
      status: 'SCHEDULED',
      terminal: 'Terminal 4',
      gate: 'B24',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      description: 'Daily non-stop flagship service from New York JFK to London Heathrow with lie-flat suites and high-speed Wi-Fi.',
      tiers: [
        { name: 'Economy Classic', cabinClass: 'ECONOMY', price: 420.0, capacity: 160, reservedCount: 1, soldCount: 120, benefits: 'In-flight entertainment, complimentary dining, standard seat selection', baggage: '1 Personal item + 1 Carry-on bag' },
        { name: 'Premium Comfort', cabinClass: 'PREMIUM_ECONOMY', price: 780.0, capacity: 32, reservedCount: 0, soldCount: 22, benefits: 'Extra legroom (38"), priority boarding, premium meal service, noise-canceling headphones', baggage: '1 Checked bag (23kg) + 1 Carry-on' },
        { name: 'Business Executive', cabinClass: 'BUSINESS', price: 2150.0, capacity: 28, reservedCount: 0, soldCount: 18, benefits: '180° Lie-flat suite, direct aisle access, Kanimo VIP Lounge, multi-course dining', baggage: '2 Checked bags (32kg each) + 2 Carry-on' },
        { name: 'Royal First Class', cabinClass: 'FIRST', price: 4600.0, capacity: 6, reservedCount: 0, soldCount: 2, benefits: 'Private enclosed cabin, caviar tasting, personal butler service, chauffeur airport transfer', baggage: '3 Checked bags (32kg each) + complimentary storage' },
      ],
    },
    {
      flightNumber: 'KN-204',
      airline: 'Kanimo Airline',
      aircraft: 'Airbus A350-1000',
      origin: 'San Francisco (SFO)',
      originCode: 'SFO',
      originCity: 'San Francisco',
      destination: 'Tokyo Haneda (HND)',
      destinationCode: 'HND',
      destinationCity: 'Tokyo',
      departureTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000 + 30 * 60 * 1000),
      duration: '10h 30m',
      status: 'SCHEDULED',
      terminal: 'International Terminal A',
      gate: 'A12',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      description: 'Ultra-long-range non-stop connection to Tokyo Haneda featuring whisper-quiet cabin pressure and Kaiseki in-flight dining.',
      tiers: [
        { name: 'Economy Classic', cabinClass: 'ECONOMY', price: 680.0, capacity: 180, reservedCount: 0, soldCount: 145, benefits: 'Personal HD screen, Japanese & Western meal selection, USB-C fast charging', baggage: '2 Checked bags (23kg each)' },
        { name: 'Premium Comfort', cabinClass: 'PREMIUM_ECONOMY', price: 1150.0, capacity: 40, reservedCount: 0, soldCount: 30, benefits: 'Dedicated cabin, 40" seat pitch, amenity kit, priority luggage delivery', baggage: '2 Checked bags (23kg each)' },
        { name: 'Business Executive', cabinClass: 'BUSINESS', price: 3400.0, capacity: 36, reservedCount: 0, soldCount: 24, benefits: 'Private sliding door suite, fine sake cellar, priority immigration fast track', baggage: '2 Checked bags (32kg each)' },
        { name: 'Royal First Class', cabinClass: 'FIRST', price: 6800.0, capacity: 6, reservedCount: 0, soldCount: 4, benefits: 'Full private bedroom suite, Dom Pérignon vintage champagne, private lounge dining', baggage: '3 Checked bags (32kg each)' },
      ],
    },
    {
      flightNumber: 'KN-502',
      airline: 'Kanimo Airline',
      aircraft: 'Airbus A321neo',
      origin: 'New York (JFK)',
      originCode: 'JFK',
      originCity: 'New York',
      destination: 'Miami International (MIA)',
      destinationCode: 'MIA',
      destinationCity: 'Miami',
      departureTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000 + 15 * 60 * 1000),
      duration: '3h 15m',
      status: 'BOARDING',
      terminal: 'Terminal 4',
      gate: 'B18',
      category: 'Domestic',
      imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
      description: 'Popular express sunshine corridor between NYC and South Beach Miami. Fast, scenic, and reliable.',
      tiers: [
        { name: 'Economy Classic', cabinClass: 'ECONOMY', price: 185.0, capacity: 130, reservedCount: 0, soldCount: 110, benefits: 'Free streaming entertainment, complimentary snacks and beverages', baggage: '1 Carry-on' },
        { name: 'Premium Comfort', cabinClass: 'PREMIUM_ECONOMY', price: 290.0, capacity: 24, reservedCount: 0, soldCount: 20, benefits: 'Priority boarding, complimentary alcoholic beverages, extra legroom', baggage: '1 Checked bag (23kg)' },
        { name: 'Business Executive', cabinClass: 'BUSINESS', price: 620.0, capacity: 16, reservedCount: 0, soldCount: 14, benefits: 'First class recliner, hot meal service, dedicated overhead bin', baggage: '2 Checked bags (32kg each)' },
      ],
    },
    {
      flightNumber: 'KN-308',
      airline: 'Kanimo Airline',
      aircraft: 'Boeing 777-300ER',
      origin: 'Dubai International (DXB)',
      originCode: 'DXB',
      originCity: 'Dubai',
      destination: 'Paris Charles de Gaulle (CDG)',
      destinationCode: 'CDG',
      destinationCity: 'Paris',
      departureTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000 + 10 * 60 * 1000),
      duration: '7h 10m',
      status: 'SCHEDULED',
      terminal: 'Terminal 3',
      gate: 'C14',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      description: 'Luxury continental connection connecting the Gulf to Paris with bespoke French cuisine and Arabic hospitality.',
      tiers: [
        { name: 'Economy Classic', cabinClass: 'ECONOMY', price: 490.0, capacity: 210, reservedCount: 0, soldCount: 160, benefits: 'Multi-course menu, 2,000 entertainment channels, complimentary amenity kit', baggage: '1 Checked bag (23kg)' },
        { name: 'Business Executive', cabinClass: 'BUSINESS', price: 2300.0, capacity: 42, reservedCount: 0, soldCount: 35, benefits: 'Private bar access, lie-flat mattress with turndown service, expedited lounge', baggage: '2 Checked bags (32kg each)' },
        { name: 'Royal First Class', cabinClass: 'FIRST', price: 5400.0, capacity: 8, reservedCount: 0, soldCount: 6, benefits: 'Private salon cabin, virtual window projection, Michelin-starred customized menu', baggage: '3 Checked bags (32kg each)' },
      ],
    },
    {
      flightNumber: 'KN-415',
      airline: 'Kanimo Airline',
      aircraft: 'Boeing 787-9 Dreamliner',
      origin: 'Los Angeles (LAX)',
      originCode: 'LAX',
      originCity: 'Los Angeles',
      destination: 'Sydney Kingsford (SYD)',
      destinationCode: 'SYD',
      destinationCity: 'Sydney',
      departureTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 50 * 60 * 1000),
      duration: '14h 50m',
      status: 'SCHEDULED',
      terminal: 'Tom Bradley Int Terminal',
      gate: 'T150',
      category: 'Luxury Charter',
      imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
      description: 'Pacific flagship journey crossing the international date line with circadian LED lighting and pressurized cabin serenity.',
      tiers: [
        { name: 'Economy Classic', cabinClass: 'ECONOMY', price: 790.0, capacity: 160, reservedCount: 0, soldCount: 120, benefits: '2 hot meals, sleep mask and socks, high-bandwidth satellite internet', baggage: '2 Checked bags (23kg each)' },
        { name: 'Premium Comfort', cabinClass: 'PREMIUM_ECONOMY', price: 1450.0, capacity: 36, reservedCount: 0, soldCount: 28, benefits: 'Deep recline cradle seat, footrest, priority baggage handling', baggage: '2 Checked bags (23kg each)' },
        { name: 'Business Executive', cabinClass: 'BUSINESS', price: 4100.0, capacity: 30, reservedCount: 0, soldCount: 22, benefits: 'All-aisle direct suites, sleep pyjamas, Australian wine tasting flights', baggage: '2 Checked bags (32kg each)' },
      ],
    },
  ];

  for (const f of flightsData) {
    const { tiers, ...flightFields } = f;
    const flight = await prisma.flight.create({
      data: flightFields,
    });

    for (const t of tiers) {
      await prisma.ticketTier.create({
        data: {
          flightId: flight.id,
          ...t,
        },
      });
    }
  }

  console.log('Created 5 flagship flights with ticket tiers');

  // 3. Create Sample Bookings & Issued Tickets for Alexander Mitchell
  const jfkFlight = await prisma.flight.findUnique({ where: { flightNumber: 'KN-101' } });
  const miaFlight = await prisma.flight.findUnique({ where: { flightNumber: 'KN-502' } });

  if (jfkFlight && miaFlight) {
    const jfkTiers = await prisma.ticketTier.findMany({ where: { flightId: jfkFlight.id } });
    const miaTiers = await prisma.ticketTier.findMany({ where: { flightId: miaFlight.id } });

    const econTier = jfkTiers.find((t) => t.cabinClass === 'ECONOMY') || jfkTiers[0];
    const bizTier = miaTiers.find((t) => t.cabinClass === 'BUSINESS') || miaTiers[0];

    // Order 1: Upcoming flight to London
    const order1 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-202610-1011',
        userId: passenger.id,
        flightId: jfkFlight.id,
        totalAmount: econTier.price,
        status: 'PAID',
        paymentMethod: 'DEMO_PAYMENT',
        passengerCount: 1,
        contactEmail: passenger.email,
        contactPhone: passenger.phone,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order1.id,
        amount: econTier.price,
        currency: 'USD',
        provider: 'DEMO',
        providerPaymentId: `demo_pay_${Date.now()}_1`,
        status: 'SUCCEEDED',
        cardLast4: '4242',
        cardBrand: 'Visa',
      },
    });

    const item1 = await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        ticketTierId: econTier.id,
        passengerName: 'Alexander Mitchell',
        passengerEmail: passenger.email,
        passportNumber: 'US89218491',
        seatNumber: '14A',
        seatPreference: 'Window',
        unitPrice: econTier.price,
      },
    });

    const ticketId1 = crypto.randomUUID();
    const ticketNum1 = 'TKT-KN-94829103';
    const security1 = generateTicketSecurity({
      ticketId: ticketId1,
      ticketNumber: ticketNum1,
      flightNumber: 'KN-101',
      passengerName: 'Alexander Mitchell',
      seatNumber: '14A',
    });

    await prisma.ticket.create({
      data: {
        id: ticketId1,
        ticketNumber: ticketNum1,
        orderId: order1.id,
        orderItemId: item1.id,
        flightId: jfkFlight.id,
        ticketTierId: econTier.id,
        userId: passenger.id,
        passengerName: 'Alexander Mitchell',
        seatNumber: '14A',
        boardingGroup: 'Group 3',
        qrSecurityPayload: security1.payload,
        securityHash: security1.securityHash,
        status: 'ISSUED',
      },
    });

    // Order 2: Checked-in Flight to Miami
    const order2 = await prisma.order.create({
      data: {
        orderNumber: 'ORD-202610-5022',
        userId: passenger.id,
        flightId: miaFlight.id,
        totalAmount: bizTier.price,
        status: 'PAID',
        paymentMethod: 'DEMO_PAYMENT',
        passengerCount: 1,
        contactEmail: passenger.email,
        contactPhone: passenger.phone,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order2.id,
        amount: bizTier.price,
        currency: 'USD',
        provider: 'DEMO',
        providerPaymentId: `demo_pay_${Date.now()}_2`,
        status: 'SUCCEEDED',
        cardLast4: '1088',
        cardBrand: 'Mastercard',
      },
    });

    const item2 = await prisma.orderItem.create({
      data: {
        orderId: order2.id,
        ticketTierId: bizTier.id,
        passengerName: 'Alexander Mitchell',
        passengerEmail: passenger.email,
        passportNumber: 'US89218491',
        seatNumber: '2B',
        seatPreference: 'Aisle',
        unitPrice: bizTier.price,
      },
    });

    const ticketId2 = crypto.randomUUID();
    const ticketNum2 = 'TKT-KN-50291844';
    const security2 = generateTicketSecurity({
      ticketId: ticketId2,
      ticketNumber: ticketNum2,
      flightNumber: 'KN-502',
      passengerName: 'Alexander Mitchell',
      seatNumber: '2B',
    });

    await prisma.ticket.create({
      data: {
        id: ticketId2,
        ticketNumber: ticketNum2,
        orderId: order2.id,
        orderItemId: item2.id,
        flightId: miaFlight.id,
        ticketTierId: bizTier.id,
        userId: passenger.id,
        passengerName: 'Alexander Mitchell',
        seatNumber: '2B',
        boardingGroup: 'Group 1',
        qrSecurityPayload: security2.payload,
        securityHash: security2.securityHash,
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedInByStaffId: staff.id,
      },
    });

    console.log('Created sample orders and digital boarding passes');

    // 4. Create Support Ticket with comments
    const supTicket = await prisma.supportTicket.create({
      data: {
        ticketCode: 'SUP-10824',
        userId: passenger.id,
        orderId: order1.id,
        subject: 'Inquiry regarding dietary meal preferences on flight KN-101',
        category: 'BOOKING_CHANGE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
      },
    });

    await prisma.supportComment.create({
      data: {
        supportTicketId: supTicket.id,
        userId: passenger.id,
        message: 'Hello, I booked ticket KN-101 and would like to confirm if gluten-free options will be available in Economy Classic?',
        isStaffReply: false,
      },
    });

    await prisma.supportComment.create({
      data: {
        supportTicketId: supTicket.id,
        userId: staff.id,
        message: 'Hello Alexander! Yes, we have added a Special Dietary Request (Gluten-Free VGML) to your reservation for seat 14A. You are all set!',
        isStaffReply: true,
      },
    });

    console.log('Created sample customer support ticket and message thread');
  }

  // 5. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'FLIGHT',
      entityId: 'SYSTEM',
      details: JSON.stringify({ message: 'Kanimo Airline platform seeded with flight inventory and initial bookings' }),
    },
  });

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
