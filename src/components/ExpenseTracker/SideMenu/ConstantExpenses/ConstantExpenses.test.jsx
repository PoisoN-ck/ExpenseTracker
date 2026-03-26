import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConstantExpenses from './index.jsx';

const mockAddConstantExpense = vi.fn();

vi.mock('@context/ConstantExpensesContext', () => ({
    useConstantExpensesContext: () => ({
        addConstantExpense: mockAddConstantExpense,
        editConstantExpense: vi.fn(),
        deleteConstantExpense: vi.fn(),
        filteredConstantExpense: { All: [], 'Not paid': [], Paid: [] },
        markExpensesAsPaid: vi.fn(),
    }),
}));

vi.mock('./ConstantExpense', () => ({
    default: ({ isCreationMode }) => (
        <div
            data-testid="constant-expense-form"
            data-creation={String(isCreationMode)}
        />
    ),
}));

vi.mock('./PlannedExpenseFilters', () => ({
    default: () => <div data-testid="planned-expense-filters" />,
}));

vi.mock('./ConstantExpensesList', () => ({
    default: () => <div data-testid="constant-expenses-list" />,
}));

vi.mock('./DayPicker', () => ({
    default: () => <div data-testid="day-picker" />,
}));

vi.mock('uuid', () => ({
    v4: () => 'generated-uuid',
}));

describe('ConstantExpenses', () => {
    beforeEach(() => {
        mockAddConstantExpense.mockReset();
        mockAddConstantExpense.mockResolvedValue(true);
    });

    it('renders when isShown is true', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(screen.getByTestId('constant-expense-form')).toBeInTheDocument();
    });

    it('applies section-shown class when isShown is true', () => {
        const { container } = render(<ConstantExpenses isShown={true} />);
        expect(container.querySelector('.section-shown')).toBeInTheDocument();
    });

    it('does not apply section-shown class when isShown is false', () => {
        const { container } = render(<ConstantExpenses isShown={false} />);
        expect(container.querySelector('.section-shown')).toBeNull();
    });

    it('renders "Add expense" button', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(
            screen.getByRole('button', { name: /add expense/i }),
        ).toBeInTheDocument();
    });

    it('renders "Existing planned expenses" heading', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(
            screen.getByText(/existing planned expenses/i),
        ).toBeInTheDocument();
    });

    it('renders ConstantExpensesList', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(
            screen.getByTestId('constant-expenses-list'),
        ).toBeInTheDocument();
    });

    it('renders PlannedExpenseFilters', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(
            screen.getByTestId('planned-expense-filters'),
        ).toBeInTheDocument();
    });

    it('renders DayPicker', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(screen.getByTestId('day-picker')).toBeInTheDocument();
    });

    it('calls addConstantExpense when "Add expense" is clicked', async () => {
        const user = userEvent.setup();
        render(<ConstantExpenses isShown={true} />);
        await user.click(screen.getByRole('button', { name: /add expense/i }));
        expect(mockAddConstantExpense).toHaveBeenCalledOnce();
        expect(mockAddConstantExpense.mock.calls[0][0]).toMatchObject({
            id: 'generated-uuid',
        });
    });

    it('renders the ConstantExpense form in creation mode', () => {
        render(<ConstantExpenses isShown={true} />);
        expect(screen.getByTestId('constant-expense-form')).toHaveAttribute(
            'data-creation',
            'true',
        );
    });
});
