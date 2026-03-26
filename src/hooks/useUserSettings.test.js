import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUserSettings from '@hooks/useUserSettings';
import { fetchValueAsPromise, updateValueWithConnectionCheck } from '@utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@context/AuthContext', () => ({
    useAuthContext: () => ({ isVerified: true }),
}));

vi.mock('@utils', () => ({
    fetchValueAsPromise: vi.fn().mockResolvedValue({
        'u-1': { name: 'Alice', color: '#fff', id: 'u-1' },
    }),
    updateValueWithConnectionCheck: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: { uid: 'user-1' } },
}));

vi.mock('firebase/database', () => ({
    onValue: vi.fn(),
    ref: vi.fn(() => ({})),
    set: vi.fn(),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useUserSettings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with empty usersSettings', () => {
        const { result } = renderHook(() => useUserSettings());
        expect(result.current.usersSettings).toEqual({});
        expect(result.current.dataError).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it('calls fetchValueAsPromise on mount', async () => {
        renderHook(() => useUserSettings());

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(fetchValueAsPromise).toHaveBeenCalled();
    });

    it('resetMessages clears dataError and successMessage', () => {
        const { result } = renderHook(() => useUserSettings());

        act(() => {
            result.current.setDataError({ code: 'some-error' });
        });
        expect(result.current.dataError).toEqual({ code: 'some-error' });

        act(() => {
            result.current.resetMessages();
        });
        expect(result.current.dataError).toBeNull();
    });

    it('addUserSettings validates name and color fields', async () => {
        const { result } = renderHook(() => useUserSettings());

        let retVal;
        await act(async () => {
            retVal = await result.current.addUserSettings({
                'u-2': { name: '', color: '' },
            });
        });

        expect(retVal).toBe(false);
        expect(result.current.dataError).toEqual({
            code: 'add-missing-fields',
        });
    });

    it('addUserSettings calls updateValueWithConnectionCheck on valid input', async () => {
        const { result } = renderHook(() => useUserSettings());

        await act(async () => {
            await result.current.addUserSettings({
                'u-2': { name: 'Bob', color: '#000', id: 'u-2' },
            });
        });

        expect(updateValueWithConnectionCheck).toHaveBeenCalled();
    });
});
