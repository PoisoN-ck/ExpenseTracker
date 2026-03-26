import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlannedExpenseFilters from './index';
import { CONSTANT_EXPENSE_FILTERS, NOT_PAID, PAID } from '@constants';

const makeFilteredExpenses = () => ({
    [NOT_PAID]: [
        {
            id: 'e-1',
            name: 'Rent',
            amount: 500,
            category: 'Utilities',
            isOneTime: false,
        },
    ],
    [PAID]: [
        {
            id: 'e-2',
            name: 'Internet',
            amount: 100,
            category: 'Utilities',
            isOneTime: false,
        },
    ],
});

describe('PlannedExpenseFilters', () => {
    it('renders all filter tabs', () => {
        render(
            <PlannedExpenseFilters
                filteredConstantExpense={makeFilteredExpenses()}
                setCurrentlyFilteredExpenses={vi.fn()}
            />,
        );
        CONSTANT_EXPENSE_FILTERS.forEach((f) =>
            expect(screen.getByText(f)).toBeInTheDocument(),
        );
    });

    it('calls setCurrentlyFilteredExpenses with all expenses on mount (All filter)', () => {
        const setCurrentlyFilteredExpenses = vi.fn();
        render(
            <PlannedExpenseFilters
                filteredConstantExpense={makeFilteredExpenses()}
                setCurrentlyFilteredExpenses={setCurrentlyFilteredExpenses}
            />,
        );
        // On initial render with "All" filter, both NOT_PAID and PAID should be combined
        expect(setCurrentlyFilteredExpenses).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ id: 'e-1' }),
                expect.objectContaining({ id: 'e-2' }),
            ]),
        );
    });

    it('calls setCurrentlyFilteredExpenses with only NOT_PAID when Not paid filter selected', async () => {
        const setCurrentlyFilteredExpenses = vi.fn();
        render(
            <PlannedExpenseFilters
                filteredConstantExpense={makeFilteredExpenses()}
                setCurrentlyFilteredExpenses={setCurrentlyFilteredExpenses}
            />,
        );
        await userEvent.click(screen.getByText(NOT_PAID));
        const lastCall = setCurrentlyFilteredExpenses.mock.calls.at(-1)[0];
        expect(lastCall).toEqual(makeFilteredExpenses()[NOT_PAID]);
    });

    it('calls setCurrentlyFilteredExpenses with only PAID when Paid filter selected', async () => {
        const setCurrentlyFilteredExpenses = vi.fn();
        render(
            <PlannedExpenseFilters
                filteredConstantExpense={makeFilteredExpenses()}
                setCurrentlyFilteredExpenses={setCurrentlyFilteredExpenses}
            />,
        );
        await userEvent.click(screen.getByText(PAID));
        const lastCall = setCurrentlyFilteredExpenses.mock.calls.at(-1)[0];
        expect(lastCall).toEqual(makeFilteredExpenses()[PAID]);
    });
});
