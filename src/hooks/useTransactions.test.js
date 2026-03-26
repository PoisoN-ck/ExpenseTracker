import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTransactions from '@hooks/useTransactions';
import { runTransaction } from 'firebase/database';
import { checkFirebaseConnection } from '@utils';

// ─── Firebase mocks ───────────────────────────────────────────────────────────

const mockOnValueUnsubscribe = vi.fn();
let onValueCallback = null;
let onValueErrorCallback = null;

vi.mock('firebase/database', () => ({
    onValue: vi.fn((ref, cb, errCb) => {
        onValueCallback = cb;
        onValueErrorCallback = errCb;
        return mockOnValueUnsubscribe;
    }),
    ref: vi.fn(() => ({})),
    runTransaction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: { uid: 'user-1' } },
}));

vi.mock('@utils', async (importOriginal) => {
    const { sortTransactionsByDate } = /** @type {any} */ (
        await importOriginal()
    );
    return {
        checkFirebaseConnection: vi.fn().mockResolvedValue(true),
        sortTransactionsByDate,
    };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeParams = (overrides = {}) => ({
    isVerified: true,
    setIsLoading: vi.fn(),
    setDataError: vi.fn(),
    setSuccessMessage: vi.fn(),
    resetMessages: vi.fn(),
    ...overrides,
});

const sampleSnapshot = (data) => ({
    val: () => data,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useTransactions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        onValueCallback = null;
        onValueErrorCallback = null;
    });

    it('initializes with empty transactions', () => {
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));
        expect(result.current.transactions).toEqual([]);
    });

    it('loads transactions from Firebase snapshot', () => {
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));

        act(() => {
            onValueCallback(
                sampleSnapshot([
                    {
                        id: '1',
                        transDate: 2000,
                        value: 100,
                        category: 'Salary',
                        transType: 'Income',
                    },
                    null, // nulls should be filtered
                    {
                        id: '2',
                        transDate: 1000,
                        value: -50,
                        category: 'Food',
                        transType: 'Expense',
                    },
                ]),
            );
        });

        expect(result.current.transactions).toHaveLength(2);
        // sorted newest first
        expect(result.current.transactions[0].id).toBe('1');
        expect(params.setIsLoading).toHaveBeenCalledWith(false);
    });

    it('calls setDataError and setIsLoading on Firebase error', () => {
        const params = makeParams();
        renderHook(() => useTransactions(params));

        const error = new Error('db-error');
        act(() => {
            onValueErrorCallback(error);
        });

        expect(params.setDataError).toHaveBeenCalledWith(error);
        expect(params.setIsLoading).toHaveBeenCalledWith(false);
    });

    it('computes totalBalance from transactions', () => {
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));

        act(() => {
            onValueCallback(
                sampleSnapshot([
                    {
                        id: '1',
                        transDate: 100,
                        value: 1000,
                        category: 'Salary',
                        transType: 'Income',
                    },
                    {
                        id: '2',
                        transDate: 50,
                        value: -300,
                        category: 'Rent',
                        transType: 'Expense',
                    },
                ]),
            );
        });

        expect(result.current.totalBalance).toBe(700);
    });

    it('addTransaction does nothing when value is falsy', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));

        await act(async () => {
            await result.current.addTransaction({ value: 0, category: 'Food' });
        });

        expect(runTransaction).not.toHaveBeenCalled();
    });

    it('addTransaction sets no-network error when disconnected', async () => {
        vi.mocked(checkFirebaseConnection).mockResolvedValueOnce(false);
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));

        await act(async () => {
            await result.current.addTransaction({
                value: 100,
                category: 'Salary',
                transType: 'Income',
                transDate: Date.now(),
                id: 'x',
            });
        });

        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-network',
        });
    });

    it('addTransaction writes to firebase when verified', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useTransactions(params));

        const transaction = {
            value: 500,
            category: 'Salary',
            transType: 'Income',
            transDate: Date.now(),
            id: 'abc',
        };
        await act(async () => {
            await result.current.addTransaction(transaction);
        });

        expect(runTransaction).toHaveBeenCalled();
        expect(params.setSuccessMessage).toHaveBeenCalledWith({
            code: 'added-transaction',
        });
    });

    it('addTransaction sets no-data-saved error when not verified', async () => {
        const params = makeParams({ isVerified: false });
        const { result } = renderHook(() => useTransactions(params));

        const transaction = {
            value: 500,
            category: 'Salary',
            transType: 'Income',
            transDate: Date.now(),
            id: 'abc',
        };
        await act(async () => {
            await result.current.addTransaction(transaction);
        });

        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-data-saved',
        });
        expect(runTransaction).not.toHaveBeenCalled();
    });

    it('payConstantExpenses does nothing for empty array', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));

        await act(async () => {
            await result.current.payConstantExpenses([]);
        });

        expect(runTransaction).not.toHaveBeenCalled();
    });

    it('payConstantExpenses returns true and sets success message', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useTransactions(params));

        const expenses = [
            { id: 'e1', category: 'Rent', amount: 500, userId: 'u1' },
        ];
        let retVal;
        await act(async () => {
            retVal = await result.current.payConstantExpenses(expenses);
        });

        expect(retVal).toBe(true);
        expect(params.setSuccessMessage).toHaveBeenCalledWith({
            code: 'constant-expenses-paid',
        });
    });

    it('payConstantExpenses sets no-network error when disconnected', async () => {
        vi.mocked(checkFirebaseConnection).mockResolvedValueOnce(false);
        const params = makeParams();
        const { result } = renderHook(() => useTransactions(params));

        const expenses = [{ id: 'e1', category: 'Rent', amount: 500 }];
        let retVal;
        await act(async () => {
            retVal = await result.current.payConstantExpenses(expenses);
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-network',
        });
    });
});
