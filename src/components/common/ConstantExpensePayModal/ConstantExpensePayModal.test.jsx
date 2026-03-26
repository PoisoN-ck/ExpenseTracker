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
        isOneTime: false,
    },
    {
        id: 'e-2',
        name: 'Internet',
        category: 'Utilities',
        amount: 80,
        isOneTime: false,
    },
];

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
});
