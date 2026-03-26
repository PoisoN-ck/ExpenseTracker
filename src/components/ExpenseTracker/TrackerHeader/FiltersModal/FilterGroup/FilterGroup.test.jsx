import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterGroup from './index';

const stringItems = ['Groceries', 'Transport', 'Utilities'];
const objectItems = [
    { name: 'This Month', value: { start: '2024-01-01', end: '2024-01-31' } },
    { name: 'Last Month', value: { start: '2023-12-01', end: '2023-12-31' } },
];

describe('FilterGroup – string items', () => {
    it('renders all filter buttons', () => {
        render(
            <FilterGroup
                items={stringItems}
                filterName="category"
                setFilter={vi.fn()}
                activeFilters={[]}
            />,
        );
        stringItems.forEach((item) =>
            expect(
                screen.getByRole('button', { name: item }),
            ).toBeInTheDocument(),
        );
    });

    it('highlights active filter with blue class', () => {
        render(
            <FilterGroup
                items={stringItems}
                filterName="category"
                setFilter={vi.fn()}
                activeFilters={['Groceries']}
            />,
        );
        expect(
            screen.getByRole('button', { name: 'Groceries' }).className,
        ).toContain('button--blue');
    });

    it('calls setFilter with { name, value } on click', async () => {
        const setFilter = vi.fn();
        render(
            <FilterGroup
                items={stringItems}
                filterName="category"
                setFilter={setFilter}
                activeFilters={[]}
            />,
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'Transport' }),
        );
        expect(setFilter).toHaveBeenCalledWith({
            name: 'category',
            value: 'Transport',
        });
    });
});

describe('FilterGroup – object items', () => {
    it('renders object item labels', () => {
        render(
            <FilterGroup
                items={objectItems}
                filterName="date"
                setFilter={vi.fn()}
                activeFilters={[]}
            />,
        );
        expect(
            screen.getByRole('button', { name: 'This Month' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Last Month' }),
        ).toBeInTheDocument();
    });

    it('calls setFilter with stringified value for object items', async () => {
        const setFilter = vi.fn();
        render(
            <FilterGroup
                items={objectItems}
                filterName="date"
                setFilter={setFilter}
                activeFilters={[]}
            />,
        );
        await userEvent.click(
            screen.getByRole('button', { name: 'This Month' }),
        );
        expect(setFilter).toHaveBeenCalledWith({
            name: 'date',
            value: JSON.stringify(objectItems[0].value),
        });
    });
});
