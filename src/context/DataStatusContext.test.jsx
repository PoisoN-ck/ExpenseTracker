import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    DataStatusProvider,
    useDataStatusContext,
} from './DataStatusContext.jsx';

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: { uid: 'user-1' } },
}));

vi.mock('firebase/auth', () => ({
    sendEmailVerification: vi.fn(),
}));

const wrapper = ({ children }) => (
    <DataStatusProvider>{children}</DataStatusProvider>
);

describe('DataStatusContext', () => {
    it('renders children inside the provider', () => {
        render(
            <DataStatusProvider>
                <div>child content</div>
            </DataStatusProvider>,
        );
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('exposes isLoading, dataError, and successMessage', () => {
        const { result } = renderHook(() => useDataStatusContext(), {
            wrapper,
        });
        expect(result.current.isLoading).toBeDefined();
        expect(result.current.dataError).toBeNull();
        expect(result.current.successMessage).toBeNull();
    });

    it('exposes resetMessages, sendVerificationEmail functions', () => {
        const { result } = renderHook(() => useDataStatusContext(), {
            wrapper,
        });
        expect(typeof result.current.resetMessages).toBe('function');
        expect(typeof result.current.sendVerificationEmail).toBe('function');
    });

    it('exposes setDataError and setSuccessMessage setters', () => {
        const { result } = renderHook(() => useDataStatusContext(), {
            wrapper,
        });
        expect(typeof result.current.setDataError).toBe('function');
        expect(typeof result.current.setSuccessMessage).toBe('function');
    });
});
