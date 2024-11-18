import { render, screen } from '@testing-library/react';
import DirectionBox from './DirectionBox';

jest.mock('@heroicons/react/24/outline', () => ({
  ArrowRightIcon: jest.fn(() => <svg data-testid="right-icon" />),
  ArrowLeftIcon: jest.fn(() => <svg data-testid="left-icon" />),
  ArrowUpIcon: jest.fn(() => <svg data-testid="straight-icon" />),
}));

describe('DirectionBox Component', () => {
  const steps = [
    { direction: 'right', description: 'Turn right at the corner' },
    { direction: 'left', description: 'Turn left at the signal' },
    { direction: 'straight', description: 'Go straight for 2km' },
  ];

  it('should render the Directions header', () => {
    render(<DirectionBox steps={steps} />);
    expect(screen.getByText('Directions')).toBeInTheDocument();
  });

  it('should render all steps with correct descriptions', () => {
    render(<DirectionBox steps={steps} />);

    steps.forEach((step) => {
      expect(screen.getByText(step.description)).toBeInTheDocument();
    });
  });

  it('should display the correct icon for each step', () => {
    render(<DirectionBox steps={steps} />);

    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('straight-icon')).toBeInTheDocument();
  });

  it('should not render any icon for an unknown direction', () => {
    const invalidSteps = [{ direction: 'unknown', description: 'Invalid direction' }];
    render(<DirectionBox steps={invalidSteps} />);

    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('straight-icon')).not.toBeInTheDocument();
  });
});
