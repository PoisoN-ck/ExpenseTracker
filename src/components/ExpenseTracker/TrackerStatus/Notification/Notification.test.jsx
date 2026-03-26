import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notification from './index';

// MUI Snackbar / Alert — use real components but speed up timers with vi.useFakeTimers
describe('Notification', () => {
    it('is not visible when messageText is empty', () => {
        render(
            <Notification
                isError={false}
                isLoading={false}
                messageText=""
                resetMessages={vi.fn()}
            />,
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows alert with message text when messageText is set and not loading', () => {
        render(
            <Notification
                isError={false}
                isLoading={false}
                messageText="Transaction added"
                resetMessages={vi.fn()}
            />,
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Transaction added')).toBeInTheDocument();
    });

    it('does not show alert while loading even if messageText is set', () => {
        render(
            <Notification
                isError={false}
                isLoading={true}
                messageText="Transaction added"
                resetMessages={vi.fn()}
            />,
        );
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders success severity (MuiAlert-colorSuccess) when isError=false', () => {
        render(
            <Notification
                isError={false}
                isLoading={false}
                messageText="All good"
                resetMessages={vi.fn()}
            />,
        );
        const alert = screen.getByRole('alert');
        expect(alert.className).toContain('MuiAlert-colorSuccess');
    });

    it('renders warning severity (MuiAlert-colorWarning) when isError=true', () => {
        render(
            <Notification
                isError={true}
                isLoading={false}
                messageText="Something went wrong"
                resetMessages={vi.fn()}
            />,
        );
        const alert = screen.getByRole('alert');
        expect(alert.className).toContain('MuiAlert-colorWarning');
    });

    it('calls resetMessages after closing the snackbar', async () => {
        const resetMessages = vi.fn();
        render(
            <Notification
                isError={false}
                isLoading={false}
                messageText="Done"
                resetMessages={resetMessages}
            />,
        );

        const closeBtn = document.querySelector('[aria-label="Close"]');
        if (closeBtn) {
            await userEvent.click(closeBtn);
            // resetMessages is called after a 500ms delay inside the component
            await act(async () => {
                await new Promise((r) => setTimeout(r, 600));
            });
            expect(resetMessages).toHaveBeenCalled();
        }
    });
});
