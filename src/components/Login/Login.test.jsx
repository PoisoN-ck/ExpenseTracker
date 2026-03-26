import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './index';

const renderLogin = (props = {}) =>
    render(
        <MemoryRouter>
            <Login
                messageText=""
                logIn={vi.fn()}
                removeMessageText={vi.fn()}
                {...props}
            />
        </MemoryRouter>,
    );

describe('Login', () => {
    it('renders the app heading', () => {
        renderLogin();
        expect(
            screen.getByRole('heading', { name: 'trakkex' }),
        ).toBeInTheDocument();
    });

    it('renders email and password inputs', () => {
        renderLogin();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('renders the Login button', () => {
        renderLogin();
        expect(
            screen.getByRole('button', { name: 'Login' }),
        ).toBeInTheDocument();
    });

    it('renders a link to the Sign Up page', () => {
        renderLogin();
        expect(
            screen.getByRole('link', { name: 'Sign Up' }),
        ).toBeInTheDocument();
    });

    it('shows messageText when provided', () => {
        renderLogin({ messageText: 'Invalid credentials' });
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('updates email field on input', async () => {
        renderLogin();
        const emailInput = screen.getByPlaceholderText('Email');
        await userEvent.type(emailInput, 'test@test.com');
        expect(emailInput).toHaveValue('test@test.com');
    });

    it('updates password field on input', async () => {
        renderLogin();
        const passwordInput = screen.getByPlaceholderText('Password');
        await userEvent.type(passwordInput, 'secret');
        expect(passwordInput).toHaveValue('secret');
    });

    it('calls logIn with email and password on form submit', async () => {
        const logIn = vi.fn();
        renderLogin({ logIn });
        await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.com');
        await userEvent.type(
            screen.getByPlaceholderText('Password'),
            'pass123',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Login' }));
        expect(logIn).toHaveBeenCalledWith({
            email: 'a@b.com',
            password: 'pass123',
        });
    });
});
