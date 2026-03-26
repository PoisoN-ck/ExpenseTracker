import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    TransactionsProvider,
    useTransactionsContext,
} from './TransactionsContext.jsx';

const mockAddTransaction = vi.fn();
const mockPayConstantExpenses = vi.fn();

vi.mock('@context/AuthContext', () => ({
    useAuthContext: vi.fn(() => ({ isVerified: true })),
}));

vi.mock('@context/DataStatusContext', () => ({
    useDataStatusContext: vi.fn(() => ({
        setIsLoading: vi.fn(),
        setDataError: vi.fn(),
        setSuccessMessage: vi.fn(),
        resetMessages: vi.fn(),
    })),
}));

vi.mock('@hooks/useTransactions', () => ({
    default: vi.fn(() => ({
        transactions: [{ id: '1', value: 100 }],
        addTransaction: mockAddTransaction,
        payConstantExpenses: mockPayConstantExpenses,
        totalBalance: 100,
    })),
}));

const wrapper = ({ children }) => (
    <TransactionsProvider>{children}</TransactionsProvider>
);

describe('TransactionsContext', () => {
    it('renders children inside the provider', () => {
        render(
            <TransactionsProvider>
                <div>child content</div>
            </TransactionsProvider>,
        );
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('exposes transactions from useTransactions', () => {
        const { result } = renderHook(() => useTransactionsContext(), {
            wrapper,
        });
        expect(result.current.transactions).toEqual([{ id: '1', value: 100 }]);
    });

    it('exposes totalBalance', () => {
        const { result } = renderHook(() => useTransactionsContext(), {
            wrapper,
        });
        expect(result.current.totalBalance).toBe(100);
    });

    it('exposes addTransaction and payConstantExpenses functions', () => {
        const { result } = renderHook(() => useTransactionsContext(), {
            wrapper,
        });
        expect(typeof result.current.addTransaction).toBe('function');
        expect(typeof result.current.payConstantExpenses).toBe('function');
    });
});
