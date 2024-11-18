import { render, screen, waitFor } from '@testing-library/react';
import dynamic from 'next/dynamic';

// Mock `next/dynamic`
jest.mock('next/dynamic', () => jest.fn());

// Mock MapComponent
const MockMapComponent = () => <div data-testid="map-component">Mock Map</div>;

describe('Home Component', () => {
  beforeEach(() => {
    (dynamic as jest.Mock).mockImplementation(() => MockMapComponent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the MapComponent dynamically', async () => {
    const Home = require('./page').default;

    render(<Home />);

    // Wait for the dynamically imported component to render
    await waitFor(() => {
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
    });

    // Verify that the mock MapComponent is rendered
    expect(screen.getByText(/Mock Map/i)).toBeInTheDocument();
  });
});
