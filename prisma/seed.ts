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

  const kanimoUser = await prisma.user.create({
    data: {
      email: 'kanimo@kanimo.com',
      password: passwordHashCustomer,
      name: 'Kani Mo',
      role: 'CUSTOMER',
      phone: '+252 63 445 9988',
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

  console.log('Created Users: Admin, Staff, Kani Mo, and Customers');

  // 2. Create Flights
  const now = new Date();
  const flightsData = [
    {
      flightNumber: 'D4721',
      airline: 'Daallo Airlines',
      aircraft: 'Boeing 737',
      origin: 'Hargeisa (HGA)',
      originCode: 'HGA',
      originCity: 'Hargeisa',
      destination: 'Mogadishu (MGQ)',
      destinationCode: 'MGQ',
      destinationCity: 'Mogadishu',
      departureTime: new Date('2026-11-15T08:30:00Z'),
      arrivalTime: new Date('2026-11-15T09:50:00Z'),
      duration: '1h 20m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'A3',
      category: 'Regional',
      imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1200&q=80',
      description: 'Morning direct flight from Hargeisa Egal International to Mogadishu Aden Adde International Airport.',
      tiers: [
        { name: 'Economy Class', cabinClass: 'ECONOMY', price: 275.0, capacity: 120, reservedCount: 5, soldCount: 45, benefits: 'Cabin baggage 7kg, Checked baggage 20kg included, complimentary refreshment', baggage: '7kg Cabin + 20kg Checked' },
        { name: 'Business Class', cabinClass: 'BUSINESS', price: 420.0, capacity: 16, reservedCount: 1, soldCount: 8, benefits: 'Priority check-in, lounge access, 30kg baggage, premium refreshment', baggage: '10kg Cabin + 30kg Checked' },
      ],
    },
    {
      flightNumber: 'FS312',
      airline: 'FlySomalia',
      aircraft: 'Boeing 737',
      origin: 'Hargeisa (HGA)',
      originCode: 'HGA',
      originCity: 'Hargeisa',
      destination: 'Mogadishu (MGQ)',
      destinationCode: 'MGQ',
      destinationCity: 'Mogadishu',
      departureTime: new Date('2026-11-15T11:15:00Z'),
      arrivalTime: new Date('2026-11-15T12:30:00Z'),
      duration: '1h 15m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'A1',
      category: 'Regional',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      description: 'Midday express connection between Hargeisa and Mogadishu with guaranteed on-time departure.',
      tiers: [
        { name: 'Economy Class', cabinClass: 'ECONOMY', price: 298.0, capacity: 130, reservedCount: 2, soldCount: 52, benefits: 'Cabin baggage 7kg, Checked baggage 20kg included, in-flight water & snacks', baggage: '7kg Cabin + 20kg Checked' },
        { name: 'Business Class', cabinClass: 'BUSINESS', price: 450.0, capacity: 12, reservedCount: 0, soldCount: 6, benefits: 'Extra legroom, priority boarding, 30kg baggage', baggage: '10kg Cabin + 30kg Checked' },
      ],
    },
    {
      flightNumber: 'AID420',
      airline: 'Air Djibouti',
      aircraft: 'Boeing 737',
      origin: 'Hargeisa (HGA)',
      originCode: 'HGA',
      originCity: 'Hargeisa',
      destination: 'Mogadishu (MGQ)',
      destinationCode: 'MGQ',
      destinationCity: 'Mogadishu',
      departureTime: new Date('2026-11-15T14:40:00Z'),
      arrivalTime: new Date('2026-11-15T16:05:00Z'),
      duration: '1h 25m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'B2',
      category: 'Regional',
      imageUrl: 'https://images.unsplash.com/photo-1517400508447-88cca558e457?auto=format&fit=crop&w=1200&q=80',
      description: 'Afternoon non-stop service connecting Somaliland and Somalia with comfortable standard cabin seating.',
      tiers: [
        { name: 'Economy Class', cabinClass: 'ECONOMY', price: 320.0, capacity: 110, reservedCount: 1, soldCount: 38, benefits: 'Cabin baggage 7kg, Checked baggage 20kg included', baggage: '7kg Cabin + 20kg Checked' },
      ],
    },
    {
      flightNumber: 'ET634',
      airline: 'Ethiopian Airlines',
      aircraft: 'Boeing 737',
      origin: 'Hargeisa (HGA)',
      originCode: 'HGA',
      originCity: 'Hargeisa',
      destination: 'Mogadishu (MGQ)',
      destinationCode: 'MGQ',
      destinationCity: 'Mogadishu',
      departureTime: new Date('2026-11-15T18:20:00Z'),
      arrivalTime: new Date('2026-11-15T19:55:00Z'),
      duration: '1h 35m',
      status: 'SCHEDULED',
      terminal: 'Terminal 2',
      gate: 'C4',
      category: 'Regional',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      description: 'Evening Star Alliance non-stop flight featuring Star Alliance frequent flyer points and warm Ethiopian hospitality.',
      tiers: [
        { name: 'Economy Class', cabinClass: 'ECONOMY', price: 345.0, capacity: 140, reservedCount: 4, soldCount: 70, benefits: 'Cabin baggage 7kg, 2x23kg checked baggage, full hot meal and drink service', baggage: '7kg Cabin + 2x23kg Checked' },
        { name: 'Cloud Nine Business', cabinClass: 'BUSINESS', price: 580.0, capacity: 16, reservedCount: 2, soldCount: 10, benefits: 'Cloud Nine VIP treatment, lounge access, 3x32kg luggage, champagne', baggage: '3x32kg Checked' },
      ],
    },
    {
      flightNumber: 'FS318',
      airline: 'FlySomalia',
      aircraft: 'Boeing 737',
      origin: 'Mogadishu (MGQ)',
      originCode: 'MGQ',
      originCity: 'Mogadishu',
      destination: 'Hargeisa (HGA)',
      destinationCode: 'HGA',
      destinationCity: 'Hargeisa',
      departureTime: new Date('2026-11-20T15:10:00Z'),
      arrivalTime: new Date('2026-11-20T16:30:00Z'),
      duration: '1h 20m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'A2',
      category: 'Regional',
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
      description: 'Return afternoon flight from Mogadishu to Hargeisa.',
      tiers: [
        { name: 'Economy Class', cabinClass: 'ECONOMY', price: 298.0, capacity: 130, reservedCount: 1, soldCount: 60, benefits: 'Cabin baggage 7kg, Checked baggage 20kg included', baggage: '7kg Cabin + 20kg Checked' },
      ],
    },
    {
      flightNumber: 'ET502',
      airline: 'Ethiopian Airlines',
      aircraft: 'Boeing 737-800',
      origin: 'Hargeisa (HGA)',
      originCode: 'HGA',
      originCity: 'Hargeisa',
      destination: 'Addis Ababa (ADD)',
      destinationCode: 'ADD',
      destinationCity: 'Addis Ababa',
      departureTime: new Date('2026-03-10T10:15:00Z'),
      arrivalTime: new Date('2026-03-10T12:45:00Z'),
      duration: '2h 30m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'B1',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
      description: 'Non-stop morning connection to Bole International Airport Addis Ababa.',
      tiers: [
        { name: 'Economy Class', cabinClass: 'ECONOMY', price: 310.0, capacity: 140, reservedCount: 0, soldCount: 95, benefits: 'Baggage 2x23kg included, hot beverage', baggage: '2x23kg Checked' },
      ],
    },
    {
      flightNumber: 'SK-DXB',
      airline: 'SkyTickets Emirates Partner',
      aircraft: 'Boeing 777-300ER',
      origin: 'Mogadishu (MGQ)',
      originCode: 'MGQ',
      originCity: 'Mogadishu',
      destination: 'Dubai (DXB)',
      destinationCode: 'DXB',
      destinationCity: 'Dubai',
      departureTime: new Date('2026-11-18T09:00:00Z'),
      arrivalTime: new Date('2026-11-18T13:45:00Z'),
      duration: '2h 45m',
      status: 'SCHEDULED',
      terminal: 'Terminal 2',
      gate: 'D5',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
      description: 'Popular direct sunshine route to Dubai International Airport.',
      tiers: [
        { name: 'Economy Round Trip', cabinClass: 'ECONOMY', price: 520.0, capacity: 200, reservedCount: 0, soldCount: 150, benefits: 'Direct flight, in-flight dining, 30kg baggage', baggage: '30kg Checked' },
      ],
    },
    {
      flightNumber: 'SK-IST',
      airline: 'SkyTickets Turkish Partner',
      aircraft: 'Airbus A330-300',
      origin: 'Mogadishu (MGQ)',
      originCode: 'MGQ',
      originCity: 'Mogadishu',
      destination: 'Istanbul (IST)',
      destinationCode: 'IST',
      destinationCity: 'Istanbul',
      departureTime: new Date('2026-11-19T06:00:00Z'),
      arrivalTime: new Date('2026-11-19T14:20:00Z'),
      duration: '6h 20m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'C2',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
      description: 'Connection to Istanbul Airport with award-winning catering.',
      tiers: [
        { name: 'Economy Round Trip', cabinClass: 'ECONOMY', price: 680.0, capacity: 180, reservedCount: 0, soldCount: 130, benefits: '1 Stop, 2x23kg baggage, Turkish delight service', baggage: '2x23kg Checked' },
      ],
    },
    {
      flightNumber: 'SK-NBO',
      airline: 'SkyTickets Kenya Partner',
      aircraft: 'Boeing 737-800',
      origin: 'Mogadishu (MGQ)',
      originCode: 'MGQ',
      originCity: 'Mogadishu',
      destination: 'Nairobi (NBO)',
      destinationCode: 'NBO',
      destinationCity: 'Nairobi',
      departureTime: new Date('2026-11-17T11:00:00Z'),
      arrivalTime: new Date('2026-11-17T19:15:00Z'),
      duration: '8h 15m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'B3',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1619865668616-e57caeb67fc1?auto=format&fit=crop&w=1200&q=80',
      description: 'Regional connection to Jomo Kenyatta International Airport.',
      tiers: [
        { name: 'Economy Round Trip', cabinClass: 'ECONOMY', price: 750.0, capacity: 160, reservedCount: 0, soldCount: 110, benefits: '1 Stop, 2x23kg baggage', baggage: '2x23kg Checked' },
      ],
    },
    {
      flightNumber: 'SK-LHR',
      airline: 'SkyTickets British Partner',
      aircraft: 'Boeing 787-9',
      origin: 'Mogadishu (MGQ)',
      originCode: 'MGQ',
      originCity: 'Mogadishu',
      destination: 'London (LHR)',
      destinationCode: 'LHR',
      destinationCity: 'London',
      departureTime: new Date('2026-11-21T08:00:00Z'),
      arrivalTime: new Date('2026-11-21T18:30:00Z'),
      duration: '10h 30m',
      status: 'SCHEDULED',
      terminal: 'Terminal 2',
      gate: 'A5',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      description: 'Intercontinental flight to London Heathrow.',
      tiers: [
        { name: 'Economy Round Trip', cabinClass: 'ECONOMY', price: 820.0, capacity: 220, reservedCount: 0, soldCount: 180, benefits: '1 Stop, full meal service, 2x23kg baggage', baggage: '2x23kg Checked' },
      ],
    },
    {
      flightNumber: 'SK-DOH',
      airline: 'SkyTickets Qatar Partner',
      aircraft: 'Airbus A350-900',
      origin: 'Mogadishu (MGQ)',
      originCode: 'MGQ',
      originCity: 'Mogadishu',
      destination: 'Doha (DOH)',
      destinationCode: 'DOH',
      destinationCity: 'Doha',
      departureTime: new Date('2026-11-22T13:00:00Z'),
      arrivalTime: new Date('2026-11-22T19:45:00Z'),
      duration: '6h 45m',
      status: 'SCHEDULED',
      terminal: 'Terminal 1',
      gate: 'D2',
      category: 'International',
      imageUrl: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=1200&q=80',
      description: 'Modern 5-star connection to Hamad International Airport Doha.',
      tiers: [
        { name: 'Economy Round Trip', cabinClass: 'ECONOMY', price: 640.0, capacity: 190, reservedCount: 0, soldCount: 140, benefits: '1 Stop, 30kg luggage, award-winning Oryx One entertainment', baggage: '30kg Checked' },
      ],
    },
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

    console.log('Created sample orders and digital boarding passes for Alexander');

    // Create Sample Bookings for Kani Mo matching Mockup
    const daalloFlight = await prisma.flight.findUnique({ where: { flightNumber: 'D4721' } });
    const fsReturnFlight = await prisma.flight.findUnique({ where: { flightNumber: 'FS318' } });
    const etAddisFlight = await prisma.flight.findUnique({ where: { flightNumber: 'ET502' } });

    if (daalloFlight) {
      const daalloTiers = await prisma.ticketTier.findMany({ where: { flightId: daalloFlight.id } });
      const dTier = daalloTiers[0];
      const kOrder1 = await prisma.order.create({
        data: {
          orderNumber: 'ORD-202611-4721',
          userId: kanimoUser.id,
          flightId: daalloFlight.id,
          totalAmount: 275.0,
          status: 'PAID',
          paymentMethod: 'MOBILE_MONEY_ZAAD',
          passengerCount: 1,
          contactEmail: kanimoUser.email,
          contactPhone: kanimoUser.phone,
        },
      });

      const kItem1 = await prisma.orderItem.create({
        data: {
          orderId: kOrder1.id,
          ticketTierId: dTier.id,
          passengerName: 'Kani Mo',
          passengerEmail: kanimoUser.email,
          passportNumber: 'SL9841029',
          seatNumber: '12A',
          seatPreference: 'Window',
          unitPrice: 275.0,
        },
      });

      const kTicketId1 = crypto.randomUUID();
      const kSecurity1 = generateTicketSecurity({
        ticketId: kTicketId1,
        ticketNumber: 'TKT-D4721-12A',
        flightNumber: 'D4721',
        passengerName: 'Kani Mo',
        seatNumber: '12A',
      });

      await prisma.ticket.create({
        data: {
          id: kTicketId1,
          ticketNumber: 'TKT-D4721-12A',
          orderId: kOrder1.id,
          orderItemId: kItem1.id,
          flightId: daalloFlight.id,
          ticketTierId: dTier.id,
          userId: kanimoUser.id,
          passengerName: 'Kani Mo',
          seatNumber: '12A',
          boardingGroup: 'Group 2',
          qrSecurityPayload: kSecurity1.payload,
          securityHash: kSecurity1.securityHash,
          status: 'ISSUED',
        },
      });
    }

    if (fsReturnFlight) {
      const fsTiers = await prisma.ticketTier.findMany({ where: { flightId: fsReturnFlight.id } });
      const fsTier = fsTiers[0];
      const kOrder2 = await prisma.order.create({
        data: {
          orderNumber: 'ORD-202611-3182',
          userId: kanimoUser.id,
          flightId: fsReturnFlight.id,
          totalAmount: 298.0,
          status: 'PAID',
          paymentMethod: 'MOBILE_MONEY_EDAHAB',
          passengerCount: 1,
          contactEmail: kanimoUser.email,
          contactPhone: kanimoUser.phone,
        },
      });

      const kItem2 = await prisma.orderItem.create({
        data: {
          orderId: kOrder2.id,
          ticketTierId: fsTier.id,
          passengerName: 'Kani Mo',
          passengerEmail: kanimoUser.email,
          passportNumber: 'SL9841029',
          seatNumber: '8F',
          seatPreference: 'Window',
          unitPrice: 298.0,
        },
      });

      const kTicketId2 = crypto.randomUUID();
      const kSecurity2 = generateTicketSecurity({
        ticketId: kTicketId2,
        ticketNumber: 'TKT-FS318-8F',
        flightNumber: 'FS318',
        passengerName: 'Kani Mo',
        seatNumber: '8F',
      });

      await prisma.ticket.create({
        data: {
          id: kTicketId2,
          ticketNumber: 'TKT-FS318-8F',
          orderId: kOrder2.id,
          orderItemId: kItem2.id,
          flightId: fsReturnFlight.id,
          ticketTierId: fsTier.id,
          userId: kanimoUser.id,
          passengerName: 'Kani Mo',
          seatNumber: '8F',
          boardingGroup: 'Group 1',
          qrSecurityPayload: kSecurity2.payload,
          securityHash: kSecurity2.securityHash,
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
        },
      });
    }

    if (etAddisFlight) {
      const etTiers = await prisma.ticketTier.findMany({ where: { flightId: etAddisFlight.id } });
      const etTier = etTiers[0];
      const kOrder3 = await prisma.order.create({
        data: {
          orderNumber: 'ORD-202603-5021',
          userId: kanimoUser.id,
          flightId: etAddisFlight.id,
          totalAmount: 310.0,
          status: 'PAID',
          paymentMethod: 'CARD',
          passengerCount: 1,
          contactEmail: kanimoUser.email,
          contactPhone: kanimoUser.phone,
        },
      });

      const kItem3 = await prisma.orderItem.create({
        data: {
          orderId: kOrder3.id,
          ticketTierId: etTier.id,
          passengerName: 'Kani Mo',
          passengerEmail: kanimoUser.email,
          passportNumber: 'SL9841029',
          seatNumber: '15C',
          seatPreference: 'Aisle',
          unitPrice: 310.0,
        },
      });

      const kTicketId3 = crypto.randomUUID();
      const kSecurity3 = generateTicketSecurity({
        ticketId: kTicketId3,
        ticketNumber: 'TKT-ET502-15C',
        flightNumber: 'ET502',
        passengerName: 'Kani Mo',
        seatNumber: '15C',
      });

      await prisma.ticket.create({
        data: {
          id: kTicketId3,
          ticketNumber: 'TKT-ET502-15C',
          orderId: kOrder3.id,
          orderItemId: kItem3.id,
          flightId: etAddisFlight.id,
          ticketTierId: etTier.id,
          userId: kanimoUser.id,
          passengerName: 'Kani Mo',
          seatNumber: '15C',
          boardingGroup: 'Group 3',
          qrSecurityPayload: kSecurity3.payload,
          securityHash: kSecurity3.securityHash,
          status: 'BOARDED',
        },
      });
    }

    console.log('Created sample orders and digital boarding passes for Kani Mo');

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
