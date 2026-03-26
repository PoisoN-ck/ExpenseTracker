import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Transactions from './index';

vi.mock('../../../img/no-transactions.svg', () => ({
    default: 'no-transactions.svg',
}));
vi.mock('@img/loading.svg', () => ({ default: 'loading.svg' }));

vi.mock('@context', () => ({
    useDataStatusContext: () => ({ isLoading: false }),
    useConstantExpensesContext: () => ({
        filteredConstantExpense: { All: [], 'Not paid': [], Paid: [] },
    }),
    useUserSettingsContext: () => ({ usersSettings: {} }),
}));

vi.mock('@utils', async (importOriginal) => {
    const mod = /** @type {any} */ (await importOriginal());
    return {
        ...mod,
        getPlannedExpenseType: vi.fn().mockReturnValue('Recurring'),
    };
});

const makeTransaction = (overrides = {}) => ({
    id: 't-1',
    category: 'Salary',
    transType: 'Income',
    transDate: new Date('2024-01-15').getTime(),
    value: 3000,
    ...overrides,
});

describe('Transactions', () => {
    it('shows NoDataScreen when transactions list is empty', () => {
        render(<Transactions transactions={[]} />);
        expect(screen.getByText(/No transactions to show/)).toBeInTheDocument();
    });

    it('renders a list item for each transaction', () => {
        const transactions = [
            makeTransaction({ id: 't-1', category: 'Salary', value: 3000 }),
            makeTransaction({
                id: 't-2',
                category: 'Rent',
                value: -500,
                transType: 'Expense',
            }),
        ];
        render(<Transactions transactions={transactions} />);
        expect(screen.getByText('Salary')).toBeInTheDocument();
        expect(screen.getByText('Rent')).toBeInTheDocument();
    });

    it('displays formatted HUF amount for each transaction', () => {
        render(
            <Transactions transactions={[makeTransaction({ value: 3000 })]} />,
        );
        expect(
            screen.getByText(new RegExp(`${(3000).toLocaleString()} HUF`)),
        ).toBeInTheDocument();
    });

    it('shows the formatted transaction date', () => {
        const transDate = new Date('2024-01-15').getTime();
        render(
            <Transactions transactions={[makeTransaction({ transDate })]} />,
        );
        expect(
            screen.getByText(new Date(transDate).toLocaleString()),
        ).toBeInTheDocument();
    });
});
