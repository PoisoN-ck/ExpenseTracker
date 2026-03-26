import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextInput from './index';

describe('TextInput', () => {
    it('renders an input with current value', () => {
        render(<TextInput value="hello" handleChange={vi.fn()} />);
        expect(screen.getByRole('textbox')).toHaveValue('hello');
    });

    it('renders a label when label prop is given', () => {
        render(
            <TextInput
                value=""
                handleChange={vi.fn()}
                label="Your name"
                id="name"
            />,
        );
        expect(screen.getByLabelText('Your name')).toBeInTheDocument();
    });

    it('does not render a label when label prop is empty', () => {
        render(<TextInput value="" handleChange={vi.fn()} />);
        expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('calls handleChange on user input', async () => {
        const handleChange = vi.fn();
        render(<TextInput value="" handleChange={handleChange} />);
        await userEvent.type(screen.getByRole('textbox'), 'A');
        expect(handleChange).toHaveBeenCalled();
    });

    it('renders placeholder text', () => {
        render(
            <TextInput
                value=""
                handleChange={vi.fn()}
                placeholder="Enter text"
            />,
        );
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('is disabled when isDisabled=true', () => {
        render(<TextInput value="" handleChange={vi.fn()} isDisabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies sm size class', () => {
        render(<TextInput value="" handleChange={vi.fn()} size="sm" />);
        expect(screen.getByRole('textbox').className).toContain(
            'input-field--sm',
        );
    });
});
