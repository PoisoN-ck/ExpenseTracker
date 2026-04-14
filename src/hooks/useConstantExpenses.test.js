import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useConstantExpenses from '@hooks/useConstantExpenses';
import { runTransaction } from 'firebase/database';
import {
    checkFirebaseConnection,
    updateValueWithConnectionCheck,
} from '@utils';

// ─── Firebase / utils mocks ───────────────────────────────────────────────────

const mockUnsubscribe = vi.fn();

vi.mock('firebase/database', () => ({
    onValue: vi.fn(() => mockUnsubscribe),
    ref: vi.fn(() => ({})),
    runTransaction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: { uid: 'user-1' } },
}));

vi.mock('@utils', () => ({
    checkFirebaseConnection: vi.fn().mockResolvedValue(true),
    fetchValueAsPromise: vi.fn().mockResolvedValue('1'),
    updateValueWithConnectionCheck: vi.fn().mockResolvedValue(true),
    getPlannedExpensesDatePeriod: vi.fn().mockReturnValue({
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31'),
    }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeParams = (overrides = {}) => ({
    isVerified: true,
    setDataError: vi.fn(),
    setSuccessMessage: vi.fn(),
    resetMessages: vi.fn(),
    ...overrides,
});

const makeExpense = (overrides = {}) => ({
    id: 'exp-1',
    name: 'Rent',
    category: 'Utilities',
    amount: 500,
    isTemporary: false,
    ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useConstantExpenses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with empty constantExpenses', () => {
        const { result } = renderHook(() => useConstantExpenses(makeParams()));
        expect(result.current.filteredConstantExpense).toBeDefined();
    });

    it('totalConstantExpensesToBePaid sums not-paid expenses', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));
        // filteredConstantExpense['Not paid'] is derived from constantExpenses
        // It starts empty
        expect(result.current.totalConstantExpensesToBePaid).toBe(0);
    });

    it('addConstantExpense validates required fields', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addConstantExpense({
                id: '',
                name: '',
                category: '',
                amount: 0,
            });
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'add-missing-fields',
        });
    });

    it('addConstantExpense sets no-network error when disconnected', async () => {
        vi.mocked(checkFirebaseConnection).mockResolvedValueOnce(false);
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addConstantExpense(makeExpense());
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-network-users-settings',
        });
    });

    it('addConstantExpense writes to firebase when verified', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addConstantExpense(makeExpense());
        });

        expect(retVal).toBe(true);
        expect(runTransaction).toHaveBeenCalled();
        expect(params.setSuccessMessage).toHaveBeenCalledWith({
            code: 'added-constant-expense',
        });
    });

    it('addConstantExpense sets no-data-saved when not verified', async () => {
        const params = makeParams({ isVerified: false });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addConstantExpense(makeExpense());
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-data-saved',
        });
    });

    it('editConstantExpense validates required fields', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.editConstantExpense({
                id: '',
                name: '',
                category: '',
                amount: 0,
            });
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'edit-missing-field',
        });
    });

    it('editConstantExpense writes to firebase when verified', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.editConstantExpense(makeExpense());
        });

        expect(retVal).toBe(true);
        expect(runTransaction).toHaveBeenCalled();
        expect(params.setSuccessMessage).toHaveBeenCalledWith({
            code: 'edited-constant-expense',
        });
    });

    it('deleteConstantExpense requires id', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.deleteConstantExpense({ id: '' });
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'delete-expense-missing-id',
        });
    });

    it('updatePlannedExpenseDayRefresh requires a day value', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        await act(async () => {
            await result.current.updatePlannedExpenseDayRefresh(null);
        });

        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'add-missing-refresh-day',
        });
    });

    it('updatePlannedExpenseDayRefresh updates day on success', async () => {
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        await act(async () => {
            await result.current.updatePlannedExpenseDayRefresh('15');
        });

        expect(updateValueWithConnectionCheck).toHaveBeenCalled();
    });
});

// ─── markExpensesAsPaid ───────────────────────────────────────────────────────

describe('markExpensesAsPaid', () => {
    beforeEach(() => vi.clearAllMocks());

    it('calls runTransaction and setSuccessMessage when verified', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.markExpensesAsPaid([makeExpense()]);
        });

        expect(retVal).toBe(true);
        expect(runTransaction).toHaveBeenCalled();
        expect(params.setSuccessMessage).toHaveBeenCalledWith({
            code: 'constant-expense-marked-as-paid',
        });
    });

    it('returns false and sets no-network error when disconnected', async () => {
        vi.mocked(checkFirebaseConnection).mockResolvedValueOnce(false);
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.markExpensesAsPaid([makeExpense()]);
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-network-users-settings',
        });
    });

    it('returns false and sets no-data-saved error when not verified', async () => {
        const params = makeParams({ isVerified: false });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.markExpensesAsPaid([makeExpense()]);
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-data-saved',
        });
    });

    it('accepts a single expense object (not wrapped in array)', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.markExpensesAsPaid(makeExpense());
        });

        expect(retVal).toBe(true);
        expect(runTransaction).toHaveBeenCalled();
    });
});

// ─── addPartialPayment ────────────────────────────────────────────────────────

describe('addPartialPayment', () => {
    beforeEach(() => vi.clearAllMocks());

    it('calls runTransaction and returns true when verified', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addPartialPayment([
                makeExpense({ isMultiple: true }),
            ]);
        });

        expect(retVal).toBe(true);
        expect(runTransaction).toHaveBeenCalled();
    });

    it('returns false and sets no-network error when disconnected', async () => {
        vi.mocked(checkFirebaseConnection).mockResolvedValueOnce(false);
        const params = makeParams();
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addPartialPayment([
                makeExpense({ isMultiple: true }),
            ]);
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).toHaveBeenCalledWith({
            code: 'no-network-users-settings',
        });
    });

    it('returns false when not verified (no network error set)', async () => {
        const params = makeParams({ isVerified: false });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addPartialPayment([
                makeExpense({ isMultiple: true }),
            ]);
        });

        expect(retVal).toBe(false);
        expect(params.setDataError).not.toHaveBeenCalled();
    });

    it('accepts a single expense object (not wrapped in array)', async () => {
        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        let retVal;
        await act(async () => {
            retVal = await result.current.addPartialPayment(
                makeExpense({ isMultiple: true }),
            );
        });

        expect(retVal).toBe(true);
        expect(runTransaction).toHaveBeenCalled();
    });

    it('stamps paidAt when payment amount reaches the planned amount', async () => {
        let capturedCallback;
        vi.mocked(runTransaction).mockImplementationOnce(
            // @ts-ignore – test mock, no need to satisfy full TransactionResult type
            async (_ref, callback) => {
                capturedCallback = callback;
            },
        );

        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        const expense = makeExpense({
            id: 'exp-1',
            amount: 100,
            isMultiple: true,
        });
        await act(async () => {
            await result.current.addPartialPayment([
                { ...expense, amount: 100 },
            ]);
        });

        // @ts-ignore – capturedCallback is always set by the mock above
        const updated = capturedCallback([{ ...expense }]);
        expect(updated[0].paidAmount).toBe(100);
        expect(updated[0].paidAt).toBeDefined();
    });

    it('does not stamp paidAt when payment is below the planned amount', async () => {
        let capturedCallback;
        vi.mocked(runTransaction).mockImplementationOnce(
            // @ts-ignore – test mock, no need to satisfy full TransactionResult type
            async (_ref, callback) => {
                capturedCallback = callback;
            },
        );

        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        const expense = makeExpense({
            id: 'exp-1',
            amount: 500,
            isMultiple: true,
        });
        await act(async () => {
            await result.current.addPartialPayment([
                { ...expense, amount: 200 },
            ]);
        });

        // @ts-ignore – capturedCallback is always set by the mock above
        const updated = capturedCallback([{ ...expense }]);
        expect(updated[0].paidAmount).toBe(200);
        expect(updated[0].paidAt).toBeUndefined();
    });

    it('accumulates paidAmount when previous payment is within the current period', async () => {
        let capturedCallback;
        vi.mocked(runTransaction).mockImplementationOnce(
            // @ts-ignore – test mock, no need to satisfy full TransactionResult type
            async (_ref, callback) => {
                capturedCallback = callback;
            },
        );

        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        const expense = makeExpense({
            id: 'exp-1',
            amount: 500,
            isMultiple: true,
        });
        // paidAmountUpdatedAt inside the mocked dayRange (2024-01-01 – 2024-01-31)
        const insidePeriod = new Date('2024-01-15').getTime();

        await act(async () => {
            await result.current.addPartialPayment([
                { ...expense, amount: 200 },
            ]);
        });

        const existingList = [
            { ...expense, paidAmount: 100, paidAmountUpdatedAt: insidePeriod },
        ];
        // @ts-ignore – capturedCallback is always set by the mock above
        const updated = capturedCallback(existingList);
        expect(updated[0].paidAmount).toBe(300); // 100 existing + 200 new
        expect(updated[0].paidAt).toBeUndefined();
    });

    it('resets paidAmount when the previous payment was in a different period', async () => {
        let capturedCallback;
        vi.mocked(runTransaction).mockImplementationOnce(
            // @ts-ignore – test mock, no need to satisfy full TransactionResult type
            async (_ref, callback) => {
                capturedCallback = callback;
            },
        );

        const params = makeParams({ isVerified: true });
        const { result } = renderHook(() => useConstantExpenses(params));

        const expense = makeExpense({
            id: 'exp-1',
            amount: 500,
            isMultiple: true,
        });
        // paidAmountUpdatedAt outside the mocked dayRange
        const outsidePeriod = new Date('2023-12-01').getTime();

        await act(async () => {
            await result.current.addPartialPayment([
                { ...expense, amount: 200 },
            ]);
        });

        const existingList = [
            { ...expense, paidAmount: 100, paidAmountUpdatedAt: outsidePeriod },
        ];
        // @ts-ignore – capturedCallback is always set by the mock above
        const updated = capturedCallback(existingList);
        expect(updated[0].paidAmount).toBe(200); // reset — only the new payment
    });
});
