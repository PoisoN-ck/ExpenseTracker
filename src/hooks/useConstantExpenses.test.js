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
    isOneTime: false,
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
