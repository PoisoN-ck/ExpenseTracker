import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUseAuth = vi.fn();

vi.mock('@hooks/useAuth', () => ({
    default: () => mockUseAuth(),
}));

import { AuthProvider, useAuthContext } from './AuthContext.jsx';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
    beforeEach(() => {
        mockUseAuth.mockReturnValue({
            authError: null,
            isLoginPending: false,
            isLoggedIn: false,
            logIn: vi.fn(),
            signUp: vi.fn(),
            logOut: vi.fn(),
            isVerified: false,
        });
    });

    it('renders children inside the provider', () => {
        render(
            <AuthProvider>
                <div>child content</div>
            </AuthProvider>,
        );
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('provides useAuth values to consumers via useAuthContext', () => {
        const { result } = renderHook(() => useAuthContext(), { wrapper });
        expect(result.current.isLoggedIn).toBe(false);
        expect(result.current.isLoginPending).toBe(false);
        expect(result.current.isVerified).toBe(false);
    });

    it('exposes logIn and signUp functions', () => {
        const { result } = renderHook(() => useAuthContext(), { wrapper });
        expect(typeof result.current.logIn).toBe('function');
        expect(typeof result.current.signUp).toBe('function');
    });

    it('exposes updated isLoggedIn when hook returns true', () => {
        mockUseAuth.mockReturnValue({
            authError: null,
            isLoginPending: false,
            isLoggedIn: true,
            logIn: vi.fn(),
            signUp: vi.fn(),
            logOut: vi.fn(),
            isVerified: true,
        });
        const { result } = renderHook(() => useAuthContext(), { wrapper });
        expect(result.current.isLoggedIn).toBe(true);
        expect(result.current.isVerified).toBe(true);
    });
});
