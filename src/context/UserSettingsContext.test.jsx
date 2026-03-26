import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    UserSettingsProvider,
    useUserSettingsContext,
} from './UserSettingsContext.jsx';

vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: { uid: 'user-1' } },
}));

vi.mock('firebase/database', () => ({
    onValue: vi.fn(),
    ref: vi.fn(),
    runTransaction: vi.fn(),
}));

vi.mock('@hooks/useUserSettings', () => ({
    default: vi.fn(() => ({
        usersSettings: { 'user-1': { name: 'Alice', color: '#ff0000' } },
        addUserSettings: vi.fn().mockResolvedValue(true),
        resetMessages: vi.fn(),
        dataError: null,
        successMessage: null,
    })),
}));

const wrapper = ({ children }) => (
    <UserSettingsProvider>{children}</UserSettingsProvider>
);

describe('UserSettingsContext', () => {
    it('renders children inside the provider', () => {
        render(
            <UserSettingsProvider>
                <div>child content</div>
            </UserSettingsProvider>,
        );
        expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('exposes usersSettings from useUserSettings', () => {
        const { result } = renderHook(() => useUserSettingsContext(), {
            wrapper,
        });
        expect(result.current.usersSettings).toEqual({
            'user-1': { name: 'Alice', color: '#ff0000' },
        });
    });

    it('exposes addUserSettings function', () => {
        const { result } = renderHook(() => useUserSettingsContext(), {
            wrapper,
        });
        expect(typeof result.current.addUserSettings).toBe('function');
    });
});
