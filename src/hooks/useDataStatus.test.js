import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDataStatus from '@hooks/useDataStatus';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/services/db';

// ─── Firebase mocks ───────────────────────────────────────────────────────────

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: null },
}));

vi.mock('firebase/auth', () => ({
    sendEmailVerification: vi.fn().mockResolvedValue(undefined),
    getAuth: vi.fn(() => ({})),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useDataStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with loading=true and no messages', () => {
        const { result } = renderHook(() => useDataStatus());
        expect(result.current.isLoading).toBe(true);
        expect(result.current.dataError).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it('resetMessages clears dataError and successMessage', () => {
        const { result } = renderHook(() => useDataStatus());

        act(() => {
            result.current.setDataError({ code: 'some-error' });
            result.current.setSuccessMessage({ code: 'some-success' });
        });
        expect(result.current.dataError).toEqual({ code: 'some-error' });
        expect(result.current.successMessage).toEqual({ code: 'some-success' });

        act(() => {
            result.current.resetMessages();
        });
        expect(result.current.dataError).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it('setIsLoading toggles loading state', () => {
        const { result } = renderHook(() => useDataStatus());
        act(() => result.current.setIsLoading(false));
        expect(result.current.isLoading).toBe(false);
    });

    it('sendVerificationEmail sends email when user exists', async () => {
        /** @type {any} */ (auth).currentUser = { uid: 'abc' };

        const { result } = renderHook(() => useDataStatus());

        await act(async () => {
            await result.current.sendVerificationEmail();
        });

        expect(sendEmailVerification).toHaveBeenCalledWith({ uid: 'abc' });
        expect(result.current.successMessage).toEqual({ code: 'email-sent' });
        /** @type {any} */ (auth).currentUser = null;
    });

    it('sendVerificationEmail sets dataError on failure', async () => {
        const error = new Error('send-failed');
        vi.mocked(sendEmailVerification).mockRejectedValueOnce(error);
        /** @type {any} */ (auth).currentUser = { uid: 'abc' };

        const { result } = renderHook(() => useDataStatus());

        await act(async () => {
            await result.current.sendVerificationEmail();
        });

        expect(result.current.dataError).toBe(error);
        /** @type {any} */ (auth).currentUser = null;
    });

    it('sendVerificationEmail does nothing when no current user', async () => {
        /** @type {any} */ (auth).currentUser = null;

        const { result } = renderHook(() => useDataStatus());

        await act(async () => {
            await result.current.sendVerificationEmail();
        });

        expect(sendEmailVerification).not.toHaveBeenCalled();
    });
});
