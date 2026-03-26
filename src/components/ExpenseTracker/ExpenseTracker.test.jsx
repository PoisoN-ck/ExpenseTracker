import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseTransactionsContext = vi.fn();
const mockUseAuthContext = vi.fn();

vi.mock('@context', () => ({
    DataStatusProvider: ({ children }) => <>{children}</>,
    TransactionsProvider: ({ children }) => <>{children}</>,
    ConstantExpensesProvider: ({ children }) => <>{children}</>,
    UserSettingsProvider: ({ children }) => <>{children}</>,
    useTransactionsContext: () => mockUseTransactionsContext(),
    useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('./ActionBar', () => ({
    default: ({ handleShowSideMenu }) => (
        <div data-testid="action-bar">
            <button onClick={handleShowSideMenu}>Open Menu</button>
        </div>
    ),
}));

vi.mock('./AllTransactionsToggler', () => ({
    default: () => <div data-testid="all-transactions-toggler" />,
}));

vi.mock('./SideMenu', () => ({
    default: ({ isShown, handleSignOut }) => (
        <div data-testid="side-menu" data-shown={String(isShown)}>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    ),
}));

vi.mock('./TrackerHeader', () => ({
    default: () => <div data-testid="tracker-header" />,
}));

vi.mock('./TrackerStatus', () => ({
    default: ({ isFilterApplied, resetFilters }) => (
        <div data-testid="tracker-status" data-filter={String(isFilterApplied)}>
            {isFilterApplied && <button onClick={resetFilters}>Reset</button>}
        </div>
    ),
}));

vi.mock('./Transactions', () => ({
    default: ({ transactions }) => (
        <div data-testid="transactions" data-count={transactions.length} />
    ),
}));

import ExpenseTracker from './index.jsx';

const sampleTransactions = [
    {
        id: '1',
        value: 100,
        transDate: 1000000,
        transType: 'Income',
        category: 'Profit',
    },
    {
        id: '2',
        value: -50,
        transDate: 900000,
        transType: 'Expense',
        category: 'Groceries',
    },
];

describe('ExpenseTracker', () => {
    beforeEach(() => {
        mockUseTransactionsContext.mockReturnValue({
            transactions: [],
        });
        mockUseAuthContext.mockReturnValue({
            logOut: vi.fn(),
        });
    });

    it('renders without crashing', () => {
        render(<ExpenseTracker />);
        expect(screen.getByTestId('tracker-header')).toBeInTheDocument();
    });

    it('renders all core sections', () => {
        render(<ExpenseTracker />);
        expect(screen.getByTestId('side-menu')).toBeInTheDocument();
        expect(screen.getByTestId('tracker-header')).toBeInTheDocument();
        expect(
            screen.getByTestId('all-transactions-toggler'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('transactions')).toBeInTheDocument();
        expect(screen.getByTestId('tracker-status')).toBeInTheDocument();
        expect(screen.getByTestId('action-bar')).toBeInTheDocument();
    });

    it('initially passes isFilterApplied=false to TrackerStatus', () => {
        render(<ExpenseTracker />);
        expect(screen.getByTestId('tracker-status')).toHaveAttribute(
            'data-filter',
            'false',
        );
    });

    it('shows correct transaction count from context', () => {
        mockUseTransactionsContext.mockReturnValue({
            transactions: sampleTransactions,
        });
        render(<ExpenseTracker />);
        // With <=7 transactions, all are shown (slice(0,7))
        expect(screen.getByTestId('transactions')).toHaveAttribute(
            'data-count',
            String(sampleTransactions.length),
        );
    });

    it('calls logOut when sign out is triggered via SideMenu', async () => {
        const user = userEvent.setup();
        const logOut = vi.fn();
        mockUseAuthContext.mockReturnValue({ logOut });
        render(<ExpenseTracker />);
        await user.click(screen.getByRole('button', { name: /sign out/i }));
        expect(logOut).toHaveBeenCalledOnce();
    });

    it('opens side menu from ActionBar', async () => {
        const user = userEvent.setup();
        render(<ExpenseTracker />);
        expect(screen.getByTestId('side-menu')).toHaveAttribute(
            'data-shown',
            'false',
        );
        await user.click(screen.getByRole('button', { name: /open menu/i }));
        expect(screen.getByTestId('side-menu')).toHaveAttribute(
            'data-shown',
            'true',
        );
    });
});
