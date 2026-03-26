import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Application from './index.jsx';

const mockUseAuthContext = vi.fn();

vi.mock('@context/AuthContext', () => ({
    AuthProvider: ({ children }) => <>{children}</>,
    useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('@components/ExpenseTracker', () => ({
    default: () => <div>ExpenseTracker</div>,
}));

vi.mock('@components/Login', () => ({
    default: () => <div>Login</div>,
}));

vi.mock('@components/SignUp', () => ({
    default: () => <div>SignUp</div>,
}));

vi.mock('@components/common/Loader', () => ({
    default: ({ isLoading }) => (isLoading ? <div>Loader</div> : null),
}));

describe('Application', () => {
    beforeEach(() => {
        mockUseAuthContext.mockReturnValue({
            authError: null,
            isLoginPending: false,
            isLoggedIn: false,
            logIn: vi.fn(),
            signUp: vi.fn(),
        });
    });

    it('shows Loader when isLoginPending is true', () => {
        mockUseAuthContext.mockReturnValue({
            authError: null,
            isLoginPending: true,
            isLoggedIn: false,
            logIn: vi.fn(),
            signUp: vi.fn(),
        });
        render(<Application />);
        expect(screen.getByText('Loader')).toBeInTheDocument();
    });

    it('hides Loader when isLoginPending is false', () => {
        render(<Application />);
        expect(screen.queryByText('Loader')).not.toBeInTheDocument();
    });

    it('renders Login page when user is not logged in', () => {
        render(<Application />);
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('does not render ExpenseTracker when user is not logged in', () => {
        render(<Application />);
        expect(screen.queryByText('ExpenseTracker')).not.toBeInTheDocument();
    });

    it('renders ExpenseTracker when user is logged in', () => {
        mockUseAuthContext.mockReturnValue({
            authError: null,
            isLoginPending: false,
            isLoggedIn: true,
            logIn: vi.fn(),
            signUp: vi.fn(),
        });
        render(<Application />);
        expect(screen.getByText('ExpenseTracker')).toBeInTheDocument();
    });

    it('does not render Login when user is logged in', () => {
        mockUseAuthContext.mockReturnValue({
            authError: null,
            isLoginPending: false,
            isLoggedIn: true,
            logIn: vi.fn(),
            signUp: vi.fn(),
        });
        render(<Application />);
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });
});
