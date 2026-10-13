import assert from 'assert';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('KANIMO AIRLINE - INTEGRATION & END-TO-END TEST SUITE');
  console.log('====================================================\n');

  let adminToken = '';
  let staffToken = '';
  let passengerToken = '';

  // 1. Test Admin Login
  console.log('1. Testing Admin Authentication...');
  const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@kanimo.com', password: 'AdminPass123!' }),
  });
  const adminData = await adminRes.json();
  assert.strictEqual(adminRes.status, 200, 'Admin login status should be 200');
  assert.strictEqual(adminData.user.role, 'ADMIN', 'Admin user role should be ADMIN');
  assert.ok(adminData.token, 'Admin login must return JWT token');
  adminToken = adminData.token;
  console.log('   ✓ Admin login successful');

  // 2. Test Staff Login
  console.log('2. Testing Gate Staff Authentication...');
  const staffRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'agent@kanimo.com', password: 'StaffPass123!' }),
  });
  const staffData = await staffRes.json();
  assert.strictEqual(staffRes.status, 200);
  assert.strictEqual(staffData.user.role, 'STAFF');
  staffToken = staffData.token;
  console.log('   ✓ Staff login successful');

  // 3. Test Passenger Login
  console.log('3. Testing Passenger Authentication...');
  const passengerRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'passenger@example.com', password: 'CustomerPass123!' }),
  });
  const passengerData = await passengerRes.json();
  assert.strictEqual(passengerRes.status, 200);
  assert.strictEqual(passengerData.user.role, 'CUSTOMER');
  passengerToken = passengerData.token;
  console.log('   ✓ Passenger login successful');

  // 4. Test Flights Discovery & Search
  console.log('4. Testing Flight Search & Availability API...');
  const flightsRes = await fetch(`${BASE_URL}/api/flights?origin=JFK`);
  const flightsData = await flightsRes.json();
  assert.strictEqual(flightsRes.status, 200);
  assert.ok(flightsData.flights.length > 0, 'Should return flights originating from JFK');
  const targetFlight = flightsData.flights[0];
  const targetTier = targetFlight.tiers[0];
  console.log(`   ✓ Found flight ${targetFlight.flightNumber} (${targetFlight.originCode} → ${targetFlight.destinationCode}) with ${targetTier.remainingSeats} seats available in ${targetTier.name}`);

  // 5. Test Concurrency-Safe Order Creation & Ticket Issuance
  console.log('5. Testing Concurrency-Safe Order Placement & Ticket Issuance...');
  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${passengerToken}`,
    },
    body: JSON.stringify({
      flightId: targetFlight.id,
      ticketTierId: targetTier.id,
      paymentMethod: 'DEMO_PAYMENT',
      passengers: [
        { name: 'Dr. Evelyn Vance', passport: 'US771029', seatPreference: 'Window' },
        { name: 'Marcus Vance', passport: 'US771030', seatPreference: 'Aisle' },
      ],
      contactEmail: 'passenger@example.com',
    }),
  });
  const orderData = await orderRes.json();
  assert.strictEqual(orderRes.status, 201, 'Order placement should return 201 Created');
  assert.ok(orderData.order, 'Order record should be created');
  assert.strictEqual(orderData.order.status, 'PAID', 'Demo order status should be PAID');
  assert.strictEqual(orderData.tickets.length, 2, 'Should issue 2 digital tickets');
  const issuedTicket = orderData.tickets[0];
  console.log(`   ✓ Order ${orderData.order.orderNumber} placed. Issued ticket: ${issuedTicket.ticketNumber} (Seat ${issuedTicket.seatNumber})`);
  assert.ok(issuedTicket.qrSecurityPayload, 'Ticket must contain HMAC security payload');
  assert.ok(issuedTicket.securityHash, 'Ticket must contain HMAC-SHA256 hash');

  // 6. Test Gate Scanner Ticket Validation (First Scan = Success)
  console.log('6. Testing Gate Scanner Ticket Validation (First Entry)...');
  const scanRes = await fetch(`${BASE_URL}/api/tickets/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({ qrPayload: issuedTicket.qrSecurityPayload }),
  });
  const scanData = await scanRes.json();
  assert.strictEqual(scanRes.status, 200, 'First gate validation should return 200');
  assert.strictEqual(scanData.ticket.status, 'CHECKED_IN', 'Ticket status should transition to CHECKED_IN');
  console.log(`   ✓ Boarding pass validated: Passenger ${scanData.passengerName} checked in at gate ${scanData.gate}`);

  // 7. Test Anti-Reuse / Single-Entry Prevention (Second Scan = 409 Conflict)
  console.log('7. Testing Single-Entry Reuse Prevention (Duplicate Scan)...');
  const duplicateScanRes = await fetch(`${BASE_URL}/api/tickets/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({ qrPayload: issuedTicket.qrSecurityPayload }),
  });
  const duplicateScanData = await duplicateScanRes.json();
  assert.strictEqual(duplicateScanRes.status, 409, 'Duplicate scan must be rejected with 409 Conflict');
  assert.ok(duplicateScanData.alreadyValidated, 'Response must flag alreadyValidated: true');
  console.log(`   ✓ Re-use prevented: "${duplicateScanData.error}"`);

  // 8. Test Tamper-Evident HMAC Verification (Forged QR Code = 400 Bad Request)
  console.log('8. Testing Counterfeit / Tampered QR Code Detection...');
  const forgedPayload = 'KANIMO:v1:fake_id|TKT-KN-FORGED|KN-101|Counterfeit User|1A|1700000000|badnonce:deadbeefcafebabe0000111122223333';
  const tamperRes = await fetch(`${BASE_URL}/api/tickets/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({ qrPayload: forgedPayload }),
  });
  const tamperData = await tamperRes.json();
  assert.strictEqual(tamperRes.status, 400, 'Tampered QR code must be rejected with 400');
  assert.ok(tamperData.isTampered, 'Response must flag isTampered: true');
  console.log(`   ✓ Tampering detected: "${tamperData.error}"`);

  // 9. Test Customer Support Desk & Comment Thread
  console.log('9. Testing Customer Support Desk & Inquiry Threading...');
  const supportRes = await fetch(`${BASE_URL}/api/support`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${passengerToken}`,
    },
    body: JSON.stringify({
      subject: 'Inquiry on infant bassinet availability',
      category: 'SEAT_UPGRADE',
      priority: 'MEDIUM',
      initialMessage: 'Can you reserve an infant bassinet row for our upcoming flight?',
    }),
  });
  const supportData = await supportRes.json();
  assert.strictEqual(supportRes.status, 201, 'Support ticket creation should return 201');
  const ticketId = supportData.supportTicket.id;
  console.log(`   ✓ Created support ticket ${supportData.supportTicket.ticketCode}`);

  // Staff replies
  const replyRes = await fetch(`${BASE_URL}/api/support/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${staffToken}`,
    },
    body: JSON.stringify({ message: 'Hello! An infant bassinet bulkhead seat has been allocated.' }),
  });
  assert.strictEqual(replyRes.status, 201, 'Staff reply should return 201');
  console.log('   ✓ Staff reply posted to conversation thread');

  // 10. Test Admin Dashboard Analytics & Financial Ledger
  console.log('10. Testing Admin Stats & Revenue Metrics...');
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  assert.strictEqual(statsRes.status, 200, 'Admin stats should return 200');
  assert.ok(statsData.stats.totalRevenue > 0, 'Total revenue should reflect purchases');
  assert.ok(statsData.stats.totalTickets > 0, 'Total tickets should be positive');
  console.log(`   ✓ Admin Metrics verified: Total Revenue = $${statsData.stats.totalRevenue}, Check-in Rate = ${statsData.stats.checkInRate}%`);

  console.log('\n====================================================');
  console.log('ALL 10 END-TO-END VERIFICATION CHECKS PASSED (100%)!');
  console.log('====================================================\n');
}

runTests().catch((e) => {
  console.error('\n❌ Test Failure:', e);
  process.exit(1);
});
