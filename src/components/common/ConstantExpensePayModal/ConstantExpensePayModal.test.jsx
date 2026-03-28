vi.mock('../../../img/no-transactions.svg', () => ({
    default: 'no-transactions.svg',
}));

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConstantExpensePayModal from './index';

const notPaidExpenses = [
    {
        id: 'e-1',
        name: 'Rent',
        category: 'Utilities',
        amount: 500,
        isTemporary: false,
    },
    {
        id: 'e-2',
        name: 'Internet',
        category: 'Utilities',
        amount: 80,
        isTemporary: false,
    },
];

const multipleExpense = {
    id: 'e-3',
    name: 'Gym',
    category: 'Health',
    amount: 200,
    isMultiple: true,
    paidAmount: 75,
};

const defaultProps = {
    payConstantExpenses: vi.fn().mockResolvedValue(true),
    notPaidConstantExpenses: notPaidExpenses,
    handleClose: vi.fn(),
    chosenUser: { id: 'u-1', name: 'Alice', color: '#fff' },
    handleShowSideMenu: vi.fn(),
};

describe('ConstantExpensePayModal', () => {
    it('renders the modal title', () => {
        render(<ConstantExpensePayModal {...defaultProps} />);
        expect(screen.getByText('Pay planned expenses')).toBeInTheDocument();
    });

    it('renders all not-paid expenses', () => {
        render(<ConstantExpensePayModal {...defaultProps} />);
        expect(screen.getByText('Rent')).toBeInTheDocument();
        expect(screen.getByText('Internet')).toBeInTheDocument();
    });

    it('shows NoDataScreen when notPaidConstantExpenses is empty', () => {
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                notPaidConstantExpenses={[]}
            />,
        );
        expect(
            screen.getByText(/No constants expenses found/),
        ).toBeInTheDocument();
    });

    it('Pay selected expenses button is disabled when none selected', () => {
        render(<ConstantExpensePayModal {...defaultProps} />);
        expect(
            screen.getByRole('button', { name: 'Pay selected expenses' }),
        ).toBeDisabled();
    });

    it('enables Pay button after selecting an expense', async () => {
        render(<ConstantExpensePayModal {...defaultProps} />);
        // SelectIcon buttons are the checkboxes
        const checkboxBtns = screen
            .getAllByRole('button', { name: '' })
            .filter((b) => b.className.includes('button-icon'));
        await userEvent.click(checkboxBtns[0]);
        expect(
            screen.getByRole('button', { name: 'Pay selected expenses' }),
        ).not.toBeDisabled();
    });

    it('calls payConstantExpenses with selected expenses on pay click', async () => {
        const payConstantExpenses = vi.fn().mockResolvedValue(true);
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                payConstantExpenses={payConstantExpenses}
            />,
        );
        const checkboxBtns = screen
            .getAllByRole('button', { name: '' })
            .filter((b) => b.className.includes('button-icon'));
        await userEvent.click(checkboxBtns[0]);
        await userEvent.click(
            screen.getByRole('button', { name: 'Pay selected expenses' }),
        );
        expect(payConstantExpenses).toHaveBeenCalled();
    });

    it('calls handleClose after successful payment', async () => {
        const handleClose = vi.fn();
        const payConstantExpenses = vi.fn().mockResolvedValue(true);
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                handleClose={handleClose}
                payConstantExpenses={payConstantExpenses}
            />,
        );
        const checkboxBtns = screen
            .getAllByRole('button', { name: '' })
            .filter((b) => b.className.includes('button-icon'));
        await userEvent.click(checkboxBtns[0]);
        await userEvent.click(
            screen.getByRole('button', { name: 'Pay selected expenses' }),
        );
        expect(handleClose).toHaveBeenCalled();
    });

    it('calls handleClose when modal close button is clicked', async () => {
        const handleClose = vi.fn();
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                handleClose={handleClose}
            />,
        );
        await userEvent.click(document.querySelector('.close-button'));
        expect(handleClose).toHaveBeenCalled();
    });

    it('shows progress hint for isMultiple expense', () => {
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                notPaidConstantExpenses={[multipleExpense]}
            />,
        );
        // progress hint: "75 / 200 HUF"
        expect(screen.getByText(/HUF/i)).toBeInTheDocument();
    });

    it('defaults amount input to remaining (amount - paidAmount) for isMultiple expense', () => {
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                notPaidConstantExpenses={[multipleExpense]}
            />,
        );
        // remaining = 200 - 75 = 125
        const input = screen.getByPlaceholderText('Amount to be paid');
        expect(input).toHaveValue('125');
    });

    it('resets amount to remaining after deselecting an isMultiple expense', async () => {
        render(
            <ConstantExpensePayModal
                {...defaultProps}
                notPaidConstantExpenses={[multipleExpense]}
            />,
        );
        const checkbox = screen
            .getAllByRole('button', { name: '' })
            .find((b) => b.className.includes('button-icon'));

        // select
        await userEvent.click(checkbox);
        // change amount
        const input = screen.getByPlaceholderText('Amount to be paid');
        await userEvent.clear(input);
        await userEvent.type(input, '50');
        expect(input).toHaveValue('50');

        // deselect — should restore to remaining (125)
        await userEvent.click(checkbox);
        expect(input).toHaveValue('125');
    });
});
