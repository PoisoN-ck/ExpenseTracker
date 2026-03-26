import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SideMenu from './index.jsx';

vi.mock('./ConstantExpenses', () => ({
    default: ({ isShown }) => (
        <div data-testid="constant-expenses" data-shown={String(isShown)} />
    ),
}));

vi.mock('./UserSettings', () => ({
    default: ({ isShown }) => (
        <div data-testid="user-settings" data-shown={String(isShown)} />
    ),
}));

const defaultProps = {
    isShown: false,
    setIsShown: vi.fn(),
    handleSignOut: vi.fn(),
};

describe('SideMenu', () => {
    beforeEach(() => {
        document.body.classList.remove('no-scroll');
    });

    afterEach(() => {
        document.body.classList.remove('no-scroll');
    });

    it('renders the menu', () => {
        const { container } = render(<SideMenu {...defaultProps} />);
        expect(container.querySelector('.menu')).toBeInTheDocument();
    });

    it('applies menu--shown class when isShown is true', () => {
        const { container } = render(
            <SideMenu {...defaultProps} isShown={true} />,
        );
        expect(container.querySelector('.menu--shown')).toBeInTheDocument();
    });

    it('does not apply menu--shown class when isShown is false', () => {
        const { container } = render(<SideMenu {...defaultProps} />);
        expect(container.querySelector('.menu--shown')).toBeNull();
    });

    it('calls handleSignOut when sign-out button is clicked', async () => {
        const user = userEvent.setup();
        const handleSignOut = vi.fn();
        const { container } = render(
            <SideMenu {...defaultProps} handleSignOut={handleSignOut} />,
        );
        await user.click(container.querySelector('.upper-menu__sign-out'));
        expect(handleSignOut).toHaveBeenCalledOnce();
    });

    it('calls setIsShown(false) when close button is clicked', async () => {
        const user = userEvent.setup();
        const setIsShown = vi.fn();
        const { container } = render(
            <SideMenu {...defaultProps} setIsShown={setIsShown} />,
        );
        await user.click(container.querySelector('.close-button-menu'));
        expect(setIsShown).toHaveBeenCalledWith(false);
    });

    it('toggles User Settings section visibility', async () => {
        const user = userEvent.setup();
        render(<SideMenu {...defaultProps} />);
        const userSettingsEl = screen.getByTestId('user-settings');
        expect(userSettingsEl).toHaveAttribute('data-shown', 'false');

        await user.click(
            screen.getByRole('button', { name: /user settings/i }),
        );
        expect(screen.getByTestId('user-settings')).toHaveAttribute(
            'data-shown',
            'true',
        );

        await user.click(
            screen.getByRole('button', { name: /user settings/i }),
        );
        expect(screen.getByTestId('user-settings')).toHaveAttribute(
            'data-shown',
            'false',
        );
    });

    it('toggles Planned expenses section visibility', async () => {
        const user = userEvent.setup();
        render(<SideMenu {...defaultProps} />);
        const constantExpensesEl = screen.getByTestId('constant-expenses');
        expect(constantExpensesEl).toHaveAttribute('data-shown', 'false');

        await user.click(
            screen.getByRole('button', { name: /planned expenses/i }),
        );
        expect(screen.getByTestId('constant-expenses')).toHaveAttribute(
            'data-shown',
            'true',
        );
    });

    it('adds no-scroll class to body when isShown is true', () => {
        act(() => {
            render(<SideMenu {...defaultProps} isShown={true} />);
        });
        expect(document.body.classList.contains('no-scroll')).toBe(true);
    });

    it('removes no-scroll class from body when isShown is false', () => {
        document.body.classList.add('no-scroll');
        act(() => {
            render(<SideMenu {...defaultProps} isShown={false} />);
        });
        expect(document.body.classList.contains('no-scroll')).toBe(false);
    });
});
