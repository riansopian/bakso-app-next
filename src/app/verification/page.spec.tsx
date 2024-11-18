/* eslint-disable react/display-name */
import { render, screen, waitFor } from '@testing-library/react';
import Verification from './page';

jest.mock('@components/VerificationForm/VerificationForm', () => () => (
  <div data-testid="verification-form">Mock Verification Form</div>
));

jest.mock('next/head', () => ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
});

describe('Verification Component', () => {
  it('should render the Head element with the correct title', async () => {
    render(<Verification />);

    // Wait for the document title to update
    await waitFor(() => {
      expect(document.title).toBe('Verification');
    });
  });

  it('should render the VerificationForm component', () => {
    render(<Verification />);

    // Verify that the mocked VerificationForm is rendered
    const verificationForm = screen.getByTestId('verification-form');
    expect(verificationForm).toBeInTheDocument();
    expect(verificationForm).toHaveTextContent('Mock Verification Form');
  });
});
