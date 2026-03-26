import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    ConstantExpensesProvider,
    useConstantExpensesContext,
} from './ConstantExpensesContext.jsx';

vi.mock('@context/AuthContext', () => ({
    useAuthContext: vi.fn(() => ({ isVerified: true })),
}));

vi.mock('@context/DataStatusContext', () => ({
    useDataStatusContext: vi.fn(() => ({
        setDataError: vi.fn(),
        setSuccessMessage: vi.fn(),
        resetMessages: vi.fn(),
    })),
}));

vi.mock('@hooks/useConstantExpenses', () => ({
    default: vi.fn(() => ({
        filteredConstantExpense: { All: [], 'Not paid': [], Paid: [] },
        plannedExpenseDayRefresh: '1',
        totalConstantExpensesToBePaid: 0,
        totalConstantExpensesAmount: 0,
        addConstantExpense: vi.fn(),
        editConstantExpense: vi.fn(),
        deleteConstantExpense: vi.fn(),
        markExpensesAsPaid: vi.fn(),
        updatePlannedExpenseDayRefresh: vi.fn(),
    })),
}));

const wrapper = ({ children }) => (
    <ConstantExpensesProvider>{children}</ConstantExpensesProvider>
);

describe('ConstantExpensesContext', () => {
    it('renders children inside the provider', () => {
        render(
            <ConstantExpensesProvider>
                <div>child content</div>
            </ConstantExpensesProvider>,
        );
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('exposes filteredConstantExpense and plannedExpenseDayRefresh', () => {
        const { result } = renderHook(() => useConstantExpensesContext(), {
            wrapper,
        });
        expect(result.current.filteredConstantExpense).toBeDefined();
        expect(result.current.plannedExpenseDayRefresh).toBe('1');
    });

    it('exposes totalConstantExpensesToBePaid and totalConstantExpensesAmount', () => {
        const { result } = renderHook(() => useConstantExpensesContext(), {
            wrapper,
        });
        expect(result.current.totalConstantExpensesToBePaid).toBe(0);
        expect(result.current.totalConstantExpensesAmount).toBe(0);
    });

    it('exposes CRUD and utility functions', () => {
        const { result } = renderHook(() => useConstantExpensesContext(), {
            wrapper,
        });
        expect(typeof result.current.addConstantExpense).toBe('function');
        expect(typeof result.current.editConstantExpense).toBe('function');
        expect(typeof result.current.deleteConstantExpense).toBe('function');
        expect(typeof result.current.markExpensesAsPaid).toBe('function');
        expect(typeof result.current.updatePlannedExpenseDayRefresh).toBe(
            'function',
        );
    });
});
