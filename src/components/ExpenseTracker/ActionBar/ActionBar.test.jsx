import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAddTransaction = vi.fn();
const mockPayConstantExpenses = vi.fn();
const mockMarkExpensesAsPaid = vi.fn();
const mockSetDataError = vi.fn();

vi.mock('@context', () => ({
    useTransactionsContext: () => ({
        addTransaction: mockAddTransaction,
        payConstantExpenses: mockPayConstantExpenses,
    }),
    useConstantExpensesContext: () => ({
        filteredConstantExpense: { 'Not paid': [], All: [], Paid: [] },
        markExpensesAsPaid: mockMarkExpensesAsPaid,
    }),
    useDataStatusContext: () => ({
        isLoading: false,
        setDataError: mockSetDataError,
    }),
}));

vi.mock('@uidotdev/usehooks', () => ({
    useLongPress: vi.fn(() => ({})),
}));

vi.mock('@components/common/AmountInput', () => ({
    default: ({ handleChange, value, placeholder }) => (
        <input
            data-testid="amount-input"
            value={value}
            placeholder={placeholder}
            onChange={(e) => handleChange(e.target.value)}
        />
    ),
}));

vi.mock('@components/common/Modal', () => ({
    default: ({ children, title }) => (
        <div data-testid="modal">
            <h2>{title}</h2>
            {children}
        </div>
    ),
}));

vi.mock('@components/common/ConstantExpensePayModal', () => ({
    default: ({ handleClose }) => (
        <div data-testid="constant-expense-pay-modal">
            <button onClick={handleClose}>Close pay modal</button>
        </div>
    ),
}));

vi.mock('uuid', () => ({
    v4: () => 'test-uuid',
}));

import ActionBar from './index.jsx';

describe('ActionBar', () => {
    const handleShowSideMenu = vi.fn();

    beforeEach(() => {
        mockAddTransaction.mockReset();
        mockSetDataError.mockReset();
        mockPayConstantExpenses.mockReset();
        localStorage.clear();
    });

    it('renders the amount input', () => {
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    });

    it('renders the Add button', () => {
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        expect(
            screen.getByRole('button', { name: /^add$/i }),
        ).toBeInTheDocument();
    });

    it('calls setDataError when Add is clicked with empty amount', async () => {
        const user = userEvent.setup();
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        await user.click(screen.getByRole('button', { name: /^add$/i }));
        expect(mockSetDataError).toHaveBeenCalledWith({ code: 'empty-value' });
    });

    it('opens category modal when Add is clicked with a non-empty amount', async () => {
        const user = userEvent.setup();
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        await user.type(screen.getByTestId('amount-input'), '100');
        await user.click(screen.getByRole('button', { name: /^add$/i }));
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Choose category')).toBeInTheDocument();
    });

    it('calls addTransaction with correct data when a category is selected', async () => {
        const user = userEvent.setup();
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        await user.type(screen.getByTestId('amount-input'), '50');
        await user.click(screen.getByRole('button', { name: /^add$/i }));
        const profitButton = screen.getByRole('button', { name: 'Profit' });
        await user.click(profitButton);
        expect(mockAddTransaction).toHaveBeenCalledOnce();
        const transaction = mockAddTransaction.mock.calls[0][0];
        expect(transaction.value).toBe('50');
        expect(transaction.category).toBe('Profit');
        expect(transaction.transType).toBe('Income');
    });

    it('calls addTransaction with negative value for non-Profit category', async () => {
        const user = userEvent.setup();
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        await user.type(screen.getByTestId('amount-input'), '30');
        await user.click(screen.getByRole('button', { name: /^add$/i }));
        await user.click(screen.getByRole('button', { name: 'Groceries' }));
        const transaction = mockAddTransaction.mock.calls[0][0];
        expect(transaction.value).toBe(-'30');
        expect(transaction.transType).toBe('Expense');
    });

    it('clears the amount input after transaction is added', async () => {
        const user = userEvent.setup();
        render(<ActionBar handleShowSideMenu={handleShowSideMenu} />);
        const input = screen.getByTestId('amount-input');
        await user.type(input, '75');
        await user.click(screen.getByRole('button', { name: /^add$/i }));
        await user.click(screen.getByRole('button', { name: 'Profit' }));
        expect(input).toHaveValue('');
    });
});
