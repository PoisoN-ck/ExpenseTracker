import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AmountInput from './index';

describe('AmountInput', () => {
    it('renders with current value', () => {
        render(<AmountInput value={100} handleChange={vi.fn()} />);
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('renders a label when label prop is given', () => {
        render(
            <AmountInput
                value={0}
                handleChange={vi.fn()}
                label="Amount"
                id="amount"
            />,
        );
        expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });

    it('calls handleChange with numeric value on valid input', async () => {
        const handleChange = vi.fn();
        const { container } = render(
            <AmountInput value="" handleChange={handleChange} />,
        );
        const input = container.querySelector('input');
        await userEvent.type(input, '5');
        expect(handleChange).toHaveBeenCalledWith(5);
    });

    it('calls handleChange with empty string for value < 1', async () => {
        const handleChange = vi.fn();
        const { container } = render(
            <AmountInput value={5} handleChange={handleChange} />,
        );
        const input = container.querySelector('input');
        await userEvent.clear(input);
        await userEvent.type(input, '0');
        expect(handleChange).toHaveBeenCalledWith('');
    });

    it('ignores non-numeric input', async () => {
        const handleChange = vi.fn();
        const { container } = render(
            <AmountInput value="" handleChange={handleChange} />,
        );
        const input = container.querySelector('input');
        await userEvent.type(input, 'abc');
        // handleChange should not be called for alphabetic characters since they fail Number() check
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('is disabled when isDisabled=true', () => {
        const { container } = render(
            <AmountInput value={10} handleChange={vi.fn()} isDisabled />,
        );
        expect(container.querySelector('input')).toBeDisabled();
    });

    it('renders placeholder text', () => {
        render(<AmountInput value="" handleChange={vi.fn()} placeholder="0" />);
        expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    });
});
