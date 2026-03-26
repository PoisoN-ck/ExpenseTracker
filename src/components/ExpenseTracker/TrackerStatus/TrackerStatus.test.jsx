import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrackerStatus from './index.jsx';

vi.mock('@context', () => ({
    useAuthContext: () => mockUseAuthContext(),
    useDataStatusContext: () => mockUseDataStatusContext(),
}));

vi.mock('./Notification', () => ({
    default: ({ messageText }) => (
        <div data-testid="notification">
            {messageText && <span>{messageText}</span>}
        </div>
    ),
}));

const mockUseAuthContext = vi.fn();
const mockUseDataStatusContext = vi.fn();

const defaultAuthCtx = { isVerified: true };
const defaultDataCtx = {
    dataError: null,
    isLoading: false,
    resetMessages: vi.fn(),
    sendVerificationEmail: vi.fn(),
    successMessage: null,
};

describe('TrackerStatus', () => {
    beforeEach(() => {
        mockUseAuthContext.mockReturnValue(defaultAuthCtx);
        mockUseDataStatusContext.mockReturnValue(defaultDataCtx);
    });

    it('renders Notification component', () => {
        render(
            <TrackerStatus isFilterApplied={false} resetFilters={vi.fn()} />,
        );
        expect(screen.getByTestId('notification')).toBeInTheDocument();
    });

    it('shows Reset Filters button when isFilterApplied is true', () => {
        render(<TrackerStatus isFilterApplied={true} resetFilters={vi.fn()} />);
        expect(
            screen.getByRole('button', { name: /reset filters/i }),
        ).toBeInTheDocument();
    });

    it('hides Reset Filters button when isFilterApplied is false', () => {
        render(
            <TrackerStatus isFilterApplied={false} resetFilters={vi.fn()} />,
        );
        expect(
            screen.queryByRole('button', { name: /reset filters/i }),
        ).not.toBeInTheDocument();
    });

    it('calls resetFilters when Reset Filters button is clicked', async () => {
        const user = userEvent.setup();
        const resetFilters = vi.fn();
        render(
            <TrackerStatus
                isFilterApplied={true}
                resetFilters={resetFilters}
            />,
        );
        await user.click(
            screen.getByRole('button', { name: /reset filters/i }),
        );
        expect(resetFilters).toHaveBeenCalledOnce();
    });

    it('shows unverified email warning when isVerified is false', () => {
        mockUseAuthContext.mockReturnValue({ isVerified: false });
        render(
            <TrackerStatus isFilterApplied={false} resetFilters={vi.fn()} />,
        );
        expect(
            screen.getByText(/you haven't verified your email/i),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /resend verification email/i }),
        ).toBeInTheDocument();
    });

    it('hides unverified email warning when isVerified is true', () => {
        render(
            <TrackerStatus isFilterApplied={false} resetFilters={vi.fn()} />,
        );
        expect(
            screen.queryByText(/you haven't verified your email/i),
        ).not.toBeInTheDocument();
    });

    it('calls sendVerificationEmail on resend button click', async () => {
        const user = userEvent.setup();
        const sendVerificationEmail = vi.fn();
        mockUseAuthContext.mockReturnValue({ isVerified: false });
        mockUseDataStatusContext.mockReturnValue({
            ...defaultDataCtx,
            sendVerificationEmail,
        });
        render(
            <TrackerStatus isFilterApplied={false} resetFilters={vi.fn()} />,
        );
        await user.click(
            screen.getByRole('button', { name: /resend verification email/i }),
        );
        expect(sendVerificationEmail).toHaveBeenCalledOnce();
    });
});
