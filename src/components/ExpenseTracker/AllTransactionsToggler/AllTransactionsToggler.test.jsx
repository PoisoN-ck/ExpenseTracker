import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AllTransactionsToggler from './index.jsx';

const fewTransactions = Array(3).fill({ id: 1, value: 10 });
const manyTransactions = Array(8).fill({ id: 1, value: 10 });

describe('AllTransactionsToggler', () => {
    it('renders nothing when transactions count is <= 7', () => {
        render(
            <AllTransactionsToggler
                isShownAllTransactions={false}
                shownTransactions={fewTransactions}
                toggleShowAllTransactions={vi.fn()}
            />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders the button when transactions count is > 7', () => {
        render(
            <AllTransactionsToggler
                isShownAllTransactions={false}
                shownTransactions={manyTransactions}
                toggleShowAllTransactions={vi.fn()}
            />,
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows "View all transactions" when isShownAllTransactions is false', () => {
        render(
            <AllTransactionsToggler
                isShownAllTransactions={false}
                shownTransactions={manyTransactions}
                toggleShowAllTransactions={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', { name: /view all transactions/i }),
        ).toBeInTheDocument();
    });

    it('shows "View less transactions" when isShownAllTransactions is true', () => {
        render(
            <AllTransactionsToggler
                isShownAllTransactions={true}
                shownTransactions={manyTransactions}
                toggleShowAllTransactions={vi.fn()}
            />,
        );
        expect(
            screen.getByRole('button', { name: /view less transactions/i }),
        ).toBeInTheDocument();
    });

    it('calls toggleShowAllTransactions when button is clicked', async () => {
        const user = userEvent.setup();
        const toggle = vi.fn();
        render(
            <AllTransactionsToggler
                isShownAllTransactions={false}
                shownTransactions={manyTransactions}
                toggleShowAllTransactions={toggle}
            />,
        );
        await user.click(screen.getByRole('button'));
        expect(toggle).toHaveBeenCalledOnce();
    });

    it('renders null container div when exactly 7 transactions', () => {
        const { container } = render(
            <AllTransactionsToggler
                isShownAllTransactions={false}
                shownTransactions={Array(7).fill({})}
                toggleShowAllTransactions={vi.fn()}
            />,
        );
        expect(container.querySelector('button')).toBeNull();
    });
});
