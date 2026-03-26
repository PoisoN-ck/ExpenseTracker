import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UserSettings from './index.jsx';

const mockAddUserSettings = vi.fn();
const mockUsersSettings = {
    'user-1': { name: 'Alice', color: '#ff0000' },
    'user-2': { name: 'Bob', color: '#00ff00' },
};

vi.mock('@context/UserSettingsContext', () => ({
    useUserSettingsContext: () => ({
        usersSettings: mockUsersSettings,
        addUserSettings: mockAddUserSettings,
    }),
}));

vi.mock('@components/common/Dropdown', () => ({
    default: ({ options, selectedValue, handleSelect, placedholder }) => (
        <select
            data-testid="dropdown"
            value={selectedValue ?? ''}
            onChange={handleSelect}
        >
            <option value="">{placedholder}</option>
            {options}
        </select>
    ),
}));

describe('UserSettings', () => {
    beforeEach(() => {
        localStorage.clear();
        mockAddUserSettings.mockReset();
        mockAddUserSettings.mockResolvedValue(true);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders the section', () => {
        render(<UserSettings isShown={true} />);
        expect(screen.getByText(/choose current user/i)).toBeInTheDocument();
    });

    it('renders user options in the dropdown', () => {
        render(<UserSettings isShown={true} />);
        expect(
            screen.getByRole('option', { name: 'Alice' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Bob' })).toBeInTheDocument();
    });

    it('applies section-shown class when isShown is true', () => {
        const { container } = render(<UserSettings isShown={true} />);
        expect(container.querySelector('.section-shown')).toBeInTheDocument();
    });

    it('does not apply section-shown class when isShown is false', () => {
        const { container } = render(<UserSettings isShown={false} />);
        expect(container.querySelector('.section-shown')).toBeNull();
    });

    it('renders the new user name input', () => {
        render(<UserSettings isShown={true} />);
        expect(screen.getByPlaceholderText(/user name/i)).toBeInTheDocument();
    });

    it('renders "Add new user" button', () => {
        render(<UserSettings isShown={true} />);
        expect(
            screen.getByRole('button', { name: /add new user/i }),
        ).toBeInTheDocument();
    });

    it('updates new user name input as user types', async () => {
        const user = userEvent.setup();
        render(<UserSettings isShown={true} />);
        const input = screen.getByPlaceholderText(/user name/i);
        await user.type(input, 'Charlie');
        expect(input).toHaveValue('Charlie');
    });

    it('calls addUserSettings with name and color on submit', async () => {
        const user = userEvent.setup();
        render(<UserSettings isShown={true} />);
        await user.type(screen.getByPlaceholderText(/user name/i), 'NewUser');
        await user.click(screen.getByRole('button', { name: /add new user/i }));
        expect(mockAddUserSettings).toHaveBeenCalledOnce();
        const callArg = mockAddUserSettings.mock.calls[0][0];
        const newUser = Object.values(callArg)[0];
        expect(newUser.name).toBe('NewUser');
    });

    it('resets name input after successful addUserSettings', async () => {
        const user = userEvent.setup();
        render(<UserSettings isShown={true} />);
        const input = screen.getByPlaceholderText(/user name/i);
        await user.type(input, 'TempName');
        await user.click(screen.getByRole('button', { name: /add new user/i }));
        expect(input).toHaveValue('');
    });

    it('saves chosen user to localStorage when selected from dropdown', async () => {
        const user = userEvent.setup();
        render(<UserSettings isShown={true} />);
        const dropdown = screen.getByTestId('dropdown');
        await act(async () => {
            await user.selectOptions(dropdown, 'user-1');
        });
        const stored = JSON.parse(localStorage.getItem('userSettings'));
        expect(stored).toMatchObject({ id: 'user-1', name: 'Alice' });
    });

    it('reads chosen user from localStorage on mount', () => {
        localStorage.setItem(
            'userSettings',
            JSON.stringify({ id: 'user-2', name: 'Bob', color: '#00ff00' }),
        );
        render(<UserSettings isShown={true} />);
        const dropdown = screen.getByTestId('dropdown');
        expect(dropdown).toHaveValue('user-2');
    });
});
