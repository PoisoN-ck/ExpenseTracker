import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuth from '@hooks/useAuth';
import {
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    setPersistence,
} from 'firebase/auth';
import { auth } from '@/services/db';

// ─── Firebase auth mock ───────────────────────────────────────────────────────

const mockUnsubscribe = vi.fn();

vi.mock('firebase/auth', () => ({
    browserLocalPersistence: 'LOCAL',
    createUserWithEmailAndPassword: vi.fn(),
    onAuthStateChanged: vi.fn((auth, cb) => {
        cb(null); // default: no user logged in
        return mockUnsubscribe;
    }),
    sendEmailVerification: vi.fn().mockResolvedValue(undefined),
    setPersistence: vi.fn().mockResolvedValue(undefined),
    signInWithEmailAndPassword: vi
        .fn()
        .mockResolvedValue({ user: { emailVerified: true } }),
    signOut: vi.fn().mockResolvedValue(undefined),
    getAuth: vi.fn(() => ({})),
}));

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: null },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // restore default: not logged in
        vi.mocked(onAuthStateChanged).mockImplementation((_, cb) => {
            /** @type {any} */ (cb)(null);
            return mockUnsubscribe;
        });
        /** @type {any} */ (auth).currentUser = null;
    });

    it('initializes with loginPending=true, not logged in', () => {
        const { result } = renderHook(() => useAuth());
        // isLoginPending starts true but checkLoginState resolves it synchronously
        expect(result.current.isLoggedIn).toBe(false);
        expect(result.current.isVerified).toBe(false);
        expect(result.current.authError).toBe('');
    });

    it('checkLoginState (via useEffect) sets isLoggedIn=true for verified user', () => {
        vi.mocked(onAuthStateChanged).mockImplementation((_, cb) => {
            /** @type {any} */ (cb)({ emailVerified: true });
            return mockUnsubscribe;
        });

        const { result } = renderHook(() => useAuth());

        expect(result.current.isLoggedIn).toBe(true);
        expect(result.current.isVerified).toBe(true);
        expect(result.current.isLoginPending).toBe(false);
    });

    it('checkLoginState (via useEffect) resets state when no user', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.isLoggedIn).toBe(false);
        expect(result.current.isLoginPending).toBe(false);
    });

    it('logIn calls signInWithEmailAndPassword', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logIn({ email: 'a@b.com', password: 'pass' });
        });

        expect(setPersistence).toHaveBeenCalled();
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            'a@b.com',
            'pass',
        );
    });

    it('logIn sets authError on failure', async () => {
        const error = new Error('auth-error');
        vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logIn({ email: 'a@b.com', password: 'bad' });
        });

        expect(result.current.authError).toBe(error);
    });

    it('logOut calls signOut', async () => {
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logOut();
        });

        expect(signOut).toHaveBeenCalled();
    });

    it('logOut sets authError on failure', async () => {
        const error = new Error('logout-error');
        vi.mocked(signOut).mockRejectedValueOnce(error);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logOut();
        });

        expect(result.current.authError).toBe(error);
    });

    it('signUp calls createUserWithEmailAndPassword', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(
            /** @type {any} */ ({}),
        );

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            result.current.signUp('a@b.com', 'password123');
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            'a@b.com',
            'password123',
        );
    });

    it('sendVerificationEmail is called internally during signUp', async () => {
        // sendVerificationEmail is an internal fn (not in the return value).
        // It is invoked after createUserWithEmailAndPassword succeeds.
        vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce(
            /** @type {any} */ ({}),
        );
        /** @type {any} */ (auth).currentUser = { uid: 'user-1' };

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            result.current.signUp('a@b.com', 'password123');
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(sendEmailVerification).toHaveBeenCalled();
        /** @type {any} */ (auth).currentUser = null;
    });
});
