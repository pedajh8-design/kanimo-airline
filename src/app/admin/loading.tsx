import React from 'react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function AdminLoading() {
  return (
    <AirplaneLandingLoader
      title="Admin Flight Operations • Connecting"
      subtitle="Synchronizing platform telemetry, bookings, and fleet status..."
      fullScreen={true}
    />
  );
}
