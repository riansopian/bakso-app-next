import { render, screen } from '@testing-library/react';
import WaypointsBox from './WaypointsBox';
import '@testing-library/jest-dom';
import { LatLngTuple } from 'leaflet';

describe('WaypointsBox Component', () => {
  const waypoints = [
    { name: 'Starting Point', hint: 'hint1', distance: 0, location: [51.505, -0.09] as LatLngTuple },
    { name: 'Midway Point', hint: 'hint2', distance: 1.2, location: [51.515, -0.1] as LatLngTuple },
    { name: 'Destination', hint: 'hint3', distance: 2.5, location: [51.525, -0.11] as LatLngTuple },
  ];

  it('renders the Alamat title', () => {
    render(<WaypointsBox waypoints={waypoints} />);
    expect(screen.getByText('Alamat')).toBeInTheDocument();
  });

  it('renders each waypoint name correctly', () => {
    render(<WaypointsBox waypoints={waypoints} />);

    waypoints.forEach((waypoint) => {
      expect(screen.getByText(waypoint.name)).toBeInTheDocument();
    });
  });
});
