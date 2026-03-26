import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConstantExpense from './index';

const makeExpense = (overrides = {}) => ({
    id: 'e-1',
    name: 'Rent',
    amount: 500,
    category: 'Utilities',
    isOneTime: false,
    ...overrides,
});

describe('ConstantExpense', () => {
    it('renders the expense name input', () => {
        render(
            <ConstantExpense
                constantExpense={makeExpense()}
                changeConstantExpense={vi.fn()}
            />,
        );
        expect(screen.getByDisplayValue('Rent')).toBeInTheDocument();
    });

    it('renders the expense amount input', () => {
        render(
            <ConstantExpense
                constantExpense={makeExpense()}
                changeConstantExpense={vi.fn()}
            />,
        );
        expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    });

    it('calls changeConstantExpense when in creation mode and name changes', async () => {
        const changeConstantExpense = vi.fn();
        render(
            <ConstantExpense
                constantExpense={makeExpense({ name: '' })}
                changeConstantExpense={changeConstantExpense}
                isCreationMode
            />,
        );
        const nameInput = screen.getByPlaceholderText(/name/i);
        await userEvent.type(nameInput, 'Electricity');
        expect(changeConstantExpense).toHaveBeenCalled();
    });

    it('all inputs are disabled when isDisabled=true', () => {
        const { container } = render(
            <ConstantExpense
                constantExpense={makeExpense()}
                changeConstantExpense={vi.fn()}
                isDisabled
            />,
        );
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach((input) => expect(input).toBeDisabled());
    });

    it('inputs are enabled when isDisabled=false', () => {
        const { container } = render(
            <ConstantExpense
                constantExpense={makeExpense()}
                changeConstantExpense={vi.fn()}
                isDisabled={false}
            />,
        );
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach((input) => expect(input).not.toBeDisabled());
    });
});
