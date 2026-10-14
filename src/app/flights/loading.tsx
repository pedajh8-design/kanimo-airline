import React from 'react';
import AirplaneLandingLoader from '@/components/AirplaneLandingLoader';

export default function FlightsLoading() {
  return (
    <AirplaneLandingLoader
      title="Radar Scanning • Global Flight Schedules"
      subtitle="Fetching real-time routes, seat availability, and fare classes..."
      fullScreen={true}
    />
  );
}
