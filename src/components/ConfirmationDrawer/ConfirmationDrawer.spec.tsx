import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDrawer from './ConfirmationDrawer';

describe('ConfirmationDrawer Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Ensure mocks are reset between tests
  });

  it('should call onClose when the background is clicked', () => {
    render(
      <ConfirmationDrawer isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm}>
        Test Content
      </ConfirmationDrawer>,
    );

    // Simulate clicking the background
    const background = screen.getByRole('button', { name: '' });
    fireEvent.click(background);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose if the drawer is not open', () => {
    render(
      <ConfirmationDrawer isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm}>
        Test Content
      </ConfirmationDrawer>,
    );

    const background = screen.queryByRole('button', { name: '' });
    expect(background).not.toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display the children content when open', () => {
    render(
      <ConfirmationDrawer isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm}>
        <p>Test Content</p>
      </ConfirmationDrawer>,
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should call onConfirm when the confirm button is clicked', () => {
    render(
      <ConfirmationDrawer isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm}>
        Test Content
      </ConfirmationDrawer>,
    );

    const confirmButton = screen.getByText('OK');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the cancel button is clicked', () => {
    render(
      <ConfirmationDrawer isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm}>
        Test Content
      </ConfirmationDrawer>,
    );

    const cancelButton = screen.getByText('Batal');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
