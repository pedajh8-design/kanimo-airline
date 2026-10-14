import React from 'react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function OrdersLoading() {
  return (
    <AirplaneLandingLoader
      title="Accessing Flight Manifests • Orders Ledger"
      subtitle="Loading passenger tickets, itinerary details, and flight statuses..."
      fullScreen={true}
    />
  );
}
