import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConstantExpensesList from './index.jsx';

vi.mock('@components/common/NoDataScreen', () => ({
    default: ({ text }) => <div data-testid="no-data-screen">{text}</div>,
}));

vi.mock('@components/common/ButtonIcon', () => ({
    default: ({ icon, handleClick, isDisabled }) => (
        <button
            data-testid="button-icon"
            data-icon={icon}
            onClick={handleClick}
            disabled={isDisabled}
        />
    ),
}));

vi.mock('../ConstantExpense', () => ({
    default: ({ constantExpense, isDisabled }) => (
        <div
            data-testid="constant-expense"
            data-id={constantExpense.id}
            data-disabled={String(isDisabled)}
        />
    ),
}));

const makeExpense = (id, name = 'Rent', amount = 100) => ({
    id,
    name,
    amount,
    category: 'Utilities',
    isTemporary: false,
});

const emptyFiltered = { All: [], 'Not paid': [], Paid: [] };

const defaultProps = {
    currentlyFilteredExpenses: [],
    editConstantExpense: vi.fn(),
    deleteConstantExpense: vi.fn(),
    markExpensesAsPaid: vi.fn(),
    filteredConstantExpense: emptyFiltered,
};

describe('ConstantExpensesList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows NoDataScreen when there are no expenses', () => {
        render(<ConstantExpensesList {...defaultProps} />);
        expect(screen.getByTestId('no-data-screen')).toBeInTheDocument();
    });

    it('shows total amount for regular expenses', () => {
        const expenses = [
            makeExpense('1', 'Rent', 200),
            makeExpense('2', 'Water', 50),
        ];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
            />,
        );
        expect(screen.getByText(/Total: 250 HUF/i)).toBeInTheDocument();
    });

    it('shows remaining amount for isMultiple expenses in the total', () => {
        const expense = {
            ...makeExpense('1', 'Gym', 200),
            isMultiple: true,
            paidAmount: 75,
        };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
            />,
        );
        // remaining = 200 - 75 = 125
        expect(screen.getByText(/Total: 125 HUF/i)).toBeInTheDocument();
    });

    it('mixes regular and isMultiple expenses correctly in the total', () => {
        const regular = makeExpense('1', 'Rent', 300);
        const multiple = {
            ...makeExpense('2', 'Gym', 200),
            isMultiple: true,
            paidAmount: 50,
        };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[regular, multiple]}
            />,
        );
        // 300 + (200 - 50) = 450
        expect(screen.getByText(/Total: 450 HUF/i)).toBeInTheDocument();
    });

    it('renders a list item for each expense', () => {
        const expenses = [makeExpense('1'), makeExpense('2')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
            />,
        );
        expect(screen.getAllByTestId('constant-expense')).toHaveLength(2);
    });

    it('shows edit (pen) button for each expense in read-only mode', () => {
        const expenses = [makeExpense('1')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
            />,
        );
        const penButtons = screen
            .getAllByTestId('button-icon')
            .filter((btn) => btn.dataset.icon === 'fa-solid fa-pen fa-xs');
        expect(penButtons).toHaveLength(1);
    });

    it('shows check and cancel buttons after entering edit mode', async () => {
        const user = userEvent.setup();
        const expenses = [makeExpense('1')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
            />,
        );
        const penButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fa-solid fa-pen fa-xs');
        await user.click(penButton);

        const checkButtons = screen
            .getAllByTestId('button-icon')
            .filter((btn) => btn.dataset.icon === 'fas fa-check fa-xs');
        expect(checkButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('calls editConstantExpense when confirm edit is clicked', async () => {
        const user = userEvent.setup();
        const editConstantExpense = vi.fn().mockResolvedValue(true);
        const expenses = [makeExpense('1')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
                editConstantExpense={editConstantExpense}
            />,
        );
        const penButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fa-solid fa-pen fa-xs');
        await user.click(penButton);

        const checkButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fas fa-check fa-xs');
        await user.click(checkButton);
        expect(editConstantExpense).toHaveBeenCalledOnce();
    });

    it('shows delete confirmation after clicking trash button', async () => {
        const user = userEvent.setup();
        const expenses = [makeExpense('1', 'Internet')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
            />,
        );
        const trashButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fa-solid fa-trash-can fa-xs');
        await user.click(trashButton);
        expect(
            screen.getByText(/delete expense 'Internet'/i),
        ).toBeInTheDocument();
    });

    it('calls deleteConstantExpense when delete is confirmed', async () => {
        const user = userEvent.setup();
        const deleteConstantExpense = vi.fn().mockResolvedValue(true);
        const expenses = [makeExpense('1', 'Netflix')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
                deleteConstantExpense={deleteConstantExpense}
            />,
        );
        const trashButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fa-solid fa-trash-can fa-xs');
        await user.click(trashButton);

        const confirmButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fas fa-check fa-xs');
        await user.click(confirmButton);
        expect(deleteConstantExpense).toHaveBeenCalledWith(expenses[0]);
    });

    it('shows mark-as-paid confirmation after clicking dollar icon', async () => {
        const user = userEvent.setup();
        const expenses = [makeExpense('1', 'Gas')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
            />,
        );
        const dollarButton = screen
            .getAllByTestId('button-icon')
            .find(
                (btn) =>
                    btn.dataset.icon === 'fa-solid fa-circle-dollar-to-slot',
            );
        await user.click(dollarButton);
        expect(
            screen.getByText(/register expense as paid 'Gas'/i),
        ).toBeInTheDocument();
    });

    it('calls markExpensesAsPaid when mark-as-paid is confirmed', async () => {
        const user = userEvent.setup();
        const markExpensesAsPaid = vi.fn().mockResolvedValue(true);
        const expenses = [makeExpense('1', 'Electricity')];
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={expenses}
                markExpensesAsPaid={markExpensesAsPaid}
            />,
        );
        const dollarButton = screen
            .getAllByTestId('button-icon')
            .find(
                (btn) =>
                    btn.dataset.icon === 'fa-solid fa-circle-dollar-to-slot',
            );
        await user.click(dollarButton);
        const confirmButton = screen
            .getAllByTestId('button-icon')
            .find((btn) => btn.dataset.icon === 'fas fa-check fa-xs');
        await user.click(confirmButton);
        expect(markExpensesAsPaid).toHaveBeenCalledWith([expenses[0]]);
    });

    it('disables the dollar button for already-paid expenses', () => {
        const expense = makeExpense('1', 'Cable');
        const filteredWithPaid = { ...emptyFiltered, Paid: [expense] };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
                filteredConstantExpense={filteredWithPaid}
            />,
        );
        const dollarButton = screen
            .getAllByTestId('button-icon')
            .find(
                (btn) =>
                    btn.dataset.icon === 'fa-solid fa-circle-dollar-to-slot',
            );
        expect(dollarButton).toBeDisabled();
    });

    it('renders Temporary badge when isTemporary is true', () => {
        const expense = { ...makeExpense('1', 'Phone'), isTemporary: true };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
            />,
        );
        expect(screen.getByText('Temporary')).toBeInTheDocument();
    });

    it('renders Multiple badge when isMultiple is true', () => {
        const expense = { ...makeExpense('1', 'Gym'), isMultiple: true };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
            />,
        );
        expect(screen.getByText('Multi')).toBeInTheDocument();
    });

    it('renders both Temporary and Multiple badges when both flags are true', () => {
        const expense = {
            ...makeExpense('1', 'Gym'),
            isTemporary: true,
            isMultiple: true,
        };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
            />,
        );
        expect(screen.getByText('Temporary')).toBeInTheDocument();
        expect(screen.getByText('Multi')).toBeInTheDocument();
    });

    it('shows progress text for an unpaid isMultiple expense', () => {
        const expense = {
            ...makeExpense('1', 'Gym', 200),
            isMultiple: true,
            paidAmount: 75,
        };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
            />,
        );
        // progress line contains the paid/total pattern "75 / 200 HUF"
        expect(screen.getByText(/75/)).toBeInTheDocument();
        expect(
            screen.getByText(
                (_, el) =>
                    el?.className?.includes(
                        'constant-expense__multiple-expense-badge',
                    ) && el.textContent.includes('75'),
            ),
        ).toBeInTheDocument();
    });

    it('does not show progress text for a paid isMultiple expense', () => {
        const expense = {
            ...makeExpense('1', 'Gym', 200),
            isMultiple: true,
            paidAmount: 200,
        };
        const filteredWithPaid = { ...emptyFiltered, Paid: [expense] };
        render(
            <ConstantExpensesList
                {...defaultProps}
                currentlyFilteredExpenses={[expense]}
                filteredConstantExpense={filteredWithPaid}
            />,
        );
        // progress line has a "/" separator — total "Total: 200 HUF" does not
        expect(screen.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument();
    });
});
