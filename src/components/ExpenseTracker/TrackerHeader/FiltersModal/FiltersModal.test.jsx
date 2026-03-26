import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FiltersModal from './index';
import { DEFAULT_FILTERS_STATE } from '@constants';

const transactions = [
    {
        id: '1',
        category: 'Groceries',
        transType: 'Expense',
        transDate: new Date('2024-01-15').getTime(),
        value: -50,
    },
    {
        id: '2',
        category: 'Salary',
        transType: 'Income',
        transDate: new Date('2024-01-20').getTime(),
        value: 3000,
    },
];

const defaultProps = {
    filters: { ...DEFAULT_FILTERS_STATE },
    setFilters: vi.fn(),
    transactions,
    setIsFilterApplied: vi.fn(),
    setFilteredTransactions: vi.fn(),
    closeModal: vi.fn(),
};

describe('FiltersModal', () => {
    it('renders the modal title', () => {
        render(<FiltersModal {...defaultProps} />);
        expect(screen.getByText('Choose filter')).toBeInTheDocument();
    });

    it('renders category filter buttons', () => {
        render(<FiltersModal {...defaultProps} />);
        expect(
            screen.getByRole('button', { name: 'Groceries' }),
        ).toBeInTheDocument();
    });

    it('renders type filter buttons', () => {
        render(<FiltersModal {...defaultProps} />);
        expect(
            screen.getByRole('button', { name: 'Expense' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Income' }),
        ).toBeInTheDocument();
    });

    it('calls closeModal when close button is clicked', async () => {
        const closeModal = vi.fn();
        render(<FiltersModal {...defaultProps} closeModal={closeModal} />);
        await userEvent.click(document.querySelector('.close-button'));
        expect(closeModal).toHaveBeenCalled();
    });

    it('toggles filter state on filter click', async () => {
        const setFilters = vi.fn();
        render(<FiltersModal {...defaultProps} setFilters={setFilters} />);
        await userEvent.click(
            screen.getByRole('button', { name: 'Groceries' }),
        );
        expect(setFilters).toHaveBeenCalled();
        const newFilters = setFilters.mock.calls[0][0];
        expect(newFilters.category).toContain('Groceries');
    });

    it('applies filters and calls setFilteredTransactions', async () => {
        const setFilteredTransactions = vi.fn();
        const setIsFilterApplied = vi.fn();
        const closeModal = vi.fn();
        render(
            <FiltersModal
                {...defaultProps}
                filters={{ ...DEFAULT_FILTERS_STATE, category: ['Groceries'] }}
                setFilteredTransactions={setFilteredTransactions}
                setIsFilterApplied={setIsFilterApplied}
                closeModal={closeModal}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: /apply/i }));
        expect(setFilteredTransactions).toHaveBeenCalled();
        expect(setIsFilterApplied).toHaveBeenCalledWith(true);
        expect(closeModal).toHaveBeenCalled();
    });
});
