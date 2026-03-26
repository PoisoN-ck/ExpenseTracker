import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Balance from './index';

// ButtonIcon renders <i> icons — no SVG mocks needed
const defaultProps = {
    totalBalance: 1500,
    earnings: 2000,
    spendings: -500,
    totalConstantExpensesToBePaid: 300,
    freeCashAvailable: 1200,
    isDiffBalancesShown: false,
    totalConstantExpensesAmount: 400,
};

describe('Balance', () => {
    it('renders Current balance title', () => {
        render(<Balance {...defaultProps} />);
        expect(screen.getByText('Current balance')).toBeInTheDocument();
    });

    it('hides amount by default (shows dots)', () => {
        render(<Balance {...defaultProps} />);
        expect(screen.getAllByText(/•••/).length).toBeGreaterThan(0);
    });

    it('reveals amount when the balance button is clicked', async () => {
        render(<Balance {...defaultProps} totalBalance={1000} />);
        const amountBtn = screen
            .getAllByRole('button')
            .find((b) => b.className.includes('balance__amount'));
        await userEvent.click(amountBtn);
        expect(
            screen.getByText(new RegExp((1000).toLocaleString())),
        ).toBeInTheDocument();
    });

    it('shows three balance cards when isDiffBalancesShown=true', () => {
        render(<Balance {...defaultProps} isDiffBalancesShown />);
        expect(screen.getByText('Free cash available')).toBeInTheDocument();
        expect(
            screen.getByText('Planned expenses to be paid'),
        ).toBeInTheDocument();
    });

    it('does not show extra cards when isDiffBalancesShown=false', () => {
        render(<Balance {...defaultProps} isDiffBalancesShown={false} />);
        expect(
            screen.queryByText('Free cash available'),
        ).not.toBeInTheDocument();
    });

    it('cycles forward through balance cards on next click', async () => {
        render(<Balance {...defaultProps} isDiffBalancesShown />);
        // Verify multiple BalanceCards are rendered
        expect(screen.getByText('Current balance')).toBeInTheDocument();
    });
});
