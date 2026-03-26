import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SignUp from './index';

const renderSignUp = (props = {}) =>
    render(
        <MemoryRouter>
            <SignUp
                messageText=""
                handleMessage={vi.fn()}
                removeMessageText={vi.fn()}
                signUp={vi.fn()}
                {...props}
            />
        </MemoryRouter>,
    );

describe('SignUp', () => {
    it('renders the app heading', () => {
        renderSignUp();
        expect(
            screen.getByRole('heading', { name: 'trakkex' }),
        ).toBeInTheDocument();
    });

    it('renders email, password, and confirm password inputs', () => {
        renderSignUp();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Confirm password'),
        ).toBeInTheDocument();
    });

    it('renders the Create button', () => {
        renderSignUp();
        expect(
            screen.getByRole('button', { name: 'Create' }),
        ).toBeInTheDocument();
    });

    it('renders a link to the Login page', () => {
        renderSignUp();
        expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    });

    it('shows messageText when provided', () => {
        renderSignUp({ messageText: 'Password too weak' });
        expect(screen.getByText('Password too weak')).toBeInTheDocument();
    });

    it('calls handleMessage and does NOT call signUp when passwords do not match', async () => {
        const handleMessage = vi.fn();
        const signUp = vi.fn();
        renderSignUp({ handleMessage, signUp });

        await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.com');
        await userEvent.type(screen.getByPlaceholderText('Password'), 'pass1');
        await userEvent.type(
            screen.getByPlaceholderText('Confirm password'),
            'pass2',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(handleMessage).toHaveBeenCalledWith({ code: 'no-match' });
        expect(signUp).not.toHaveBeenCalled();
    });

    it('calls signUp with email and password when passwords match', async () => {
        const signUp = vi.fn().mockResolvedValue(undefined);
        renderSignUp({ signUp });

        await userEvent.type(screen.getByPlaceholderText('Email'), 'a@b.com');
        await userEvent.type(
            screen.getByPlaceholderText('Password'),
            'password123',
        );
        await userEvent.type(
            screen.getByPlaceholderText('Confirm password'),
            'password123',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(signUp).toHaveBeenCalledWith('a@b.com', 'password123');
    });

    it('resets form fields after successful sign up', async () => {
        const signUp = vi.fn().mockResolvedValue(undefined);
        renderSignUp({ signUp });

        const emailInput = screen.getByPlaceholderText('Email');
        await userEvent.type(emailInput, 'a@b.com');
        await userEvent.type(
            screen.getByPlaceholderText('Password'),
            'password123',
        );
        await userEvent.type(
            screen.getByPlaceholderText('Confirm password'),
            'password123',
        );
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(emailInput).toHaveValue('');
    });
});
