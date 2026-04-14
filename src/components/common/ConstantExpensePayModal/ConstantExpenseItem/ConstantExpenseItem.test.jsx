import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConstantExpenseItem from './index';

const baseExpense = {
    id: 'e-1',
    name: 'Rent',
    category: 'Utilities',
    amount: 500,
    isSelected: false,
    isMultiple: false,
};

const defaultProps = {
    expense: baseExpense,
    notPaidConstantExpenses: [{ ...baseExpense }],
    handleSelect: vi.fn(),
    handleAmountChange: vi.fn(),
};

describe('ConstantExpenseItem', () => {
    it('renders expense name and category', () => {
        render(<ConstantExpenseItem {...defaultProps} />);
        expect(screen.getByText('Rent')).toBeInTheDocument();
        expect(screen.getByText('Category: Utilities')).toBeInTheDocument();
    });

    it('applies muted styles when not selected', () => {
        render(<ConstantExpenseItem {...defaultProps} />);
        const li = screen.getByRole('listitem');
        expect(li.className).not.toContain('shadow__highlighted');
    });

    it('applies highlighted style when selected', () => {
        render(
            <ConstantExpenseItem
                {...defaultProps}
                expense={{ ...baseExpense, isSelected: true }}
            />,
        );
        const li = screen.getByRole('listitem');
        expect(li.className).toContain('shadow__highlighted');
    });

    it('calls handleSelect with toggled value on button click', async () => {
        const handleSelect = vi.fn();
        render(
            <ConstantExpenseItem
                {...defaultProps}
                handleSelect={handleSelect}
            />,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(handleSelect).toHaveBeenCalledWith(true, baseExpense);
    });

    it('calls handleSelect with false when expense is selected', async () => {
        const handleSelect = vi.fn();
        const selectedExpense = { ...baseExpense, isSelected: true };
        render(
            <ConstantExpenseItem
                {...defaultProps}
                expense={selectedExpense}
                handleSelect={handleSelect}
            />,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(handleSelect).toHaveBeenCalledWith(false, selectedExpense);
    });

    it('does not show paid progress for non-multiple expenses', () => {
        render(<ConstantExpenseItem {...defaultProps} />);
        expect(screen.queryByText(/HUF paid/)).not.toBeInTheDocument();
    });

    it('shows paid progress for multiple expenses', () => {
        const multipleExpense = {
            ...baseExpense,
            isMultiple: true,
            paidAmount: 150,
            amount: 500,
        };
        render(
            <ConstantExpenseItem
                {...defaultProps}
                expense={multipleExpense}
                notPaidConstantExpenses={[multipleExpense]}
            />,
        );
        expect(screen.getByText(/HUF/)).toBeInTheDocument();
        expect(
            screen.getByText(new RegExp(`${(150).toLocaleString()}`)),
        ).toBeInTheDocument();
    });

    it('falls back to expense.amount in progress when id not found in notPaidConstantExpenses', () => {
        const multipleExpense = {
            ...baseExpense,
            isMultiple: true,
            paidAmount: 0,
            amount: 300,
        };
        render(
            <ConstantExpenseItem
                {...defaultProps}
                expense={multipleExpense}
                notPaidConstantExpenses={[]}
            />,
        );
        expect(screen.getByText(/HUF/)).toBeInTheDocument();
    });

    it('AmountInput is disabled when expense is not selected', () => {
        render(<ConstantExpenseItem {...defaultProps} />);
        expect(screen.getByPlaceholderText('Amount to be paid')).toBeDisabled();
    });

    it('AmountInput is enabled when expense is selected', () => {
        render(
            <ConstantExpenseItem
                {...defaultProps}
                expense={{ ...baseExpense, isSelected: true }}
            />,
        );
        expect(
            screen.getByPlaceholderText('Amount to be paid'),
        ).not.toBeDisabled();
    });
});
