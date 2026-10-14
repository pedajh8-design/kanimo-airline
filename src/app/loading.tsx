import React from 'react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function Loading() {
  return (
    <AirplaneLandingLoader
      title="Approaching Runway • Preparing for Landing"
      subtitle="Kanimo Skyways Flight Navigation & Global Reservations"
      fullScreen={true}
    />
  );
}
