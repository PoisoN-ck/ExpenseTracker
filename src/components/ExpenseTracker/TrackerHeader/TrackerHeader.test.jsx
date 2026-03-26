import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TrackerHeader from './index.jsx';

const mockUseTransactionsContext = vi.fn();
const mockUseConstantExpensesContext = vi.fn();

vi.mock('@context', () => ({
    useTransactionsContext: () => mockUseTransactionsContext(),
    useConstantExpensesContext: () => mockUseConstantExpensesContext(),
}));

vi.mock('./Balance', () => ({
    default: () => <div data-testid="balance" />,
}));

vi.mock('./FiltersModal', () => ({
    default: ({ closeModal }) => (
        <div data-testid="filters-modal">
            <button onClick={closeModal}>Close Filters</button>
        </div>
    ),
}));

const emptyFilteredConstantExpense = { All: [], 'Not paid': [], Paid: [] };

const defaultProps = {
    filters: { category: [], date: [], type: [] },
    setFilters: vi.fn(),
    setIsFilterApplied: vi.fn(),
    setFilteredTransactions: vi.fn(),
    shownTransactions: [],
    setIsMenuShown: vi.fn(),
};

describe('TrackerHeader', () => {
    beforeEach(() => {
        mockUseTransactionsContext.mockReturnValue({
            transactions: [],
            totalBalance: 0,
        });
        mockUseConstantExpensesContext.mockReturnValue({
            totalConstantExpensesToBePaid: 0,
            totalConstantExpensesAmount: 0,
            filteredConstantExpense: emptyFilteredConstantExpense,
        });
    });

    it('renders the header', () => {
        const { container } = render(<TrackerHeader {...defaultProps} />);
        expect(container.querySelector('header')).toBeInTheDocument();
    });

    it('renders Balance component', () => {
        render(<TrackerHeader {...defaultProps} />);
        expect(screen.getByTestId('balance')).toBeInTheDocument();
    });

    it('does not show FiltersModal by default', () => {
        render(<TrackerHeader {...defaultProps} />);
        expect(screen.queryByTestId('filters-modal')).not.toBeInTheDocument();
    });

    it('opens FiltersModal when filter button is clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(<TrackerHeader {...defaultProps} />);
        await user.click(
            container.querySelector('.upper-menu__filter-trigger'),
        );
        expect(screen.getByTestId('filters-modal')).toBeInTheDocument();
    });

    it('closes FiltersModal when closeModal is called', async () => {
        const user = userEvent.setup();
        const { container } = render(<TrackerHeader {...defaultProps} />);
        await user.click(
            container.querySelector('.upper-menu__filter-trigger'),
        );
        expect(screen.getByTestId('filters-modal')).toBeInTheDocument();
        await user.click(
            screen.getByRole('button', { name: /close filters/i }),
        );
        expect(screen.queryByTestId('filters-modal')).not.toBeInTheDocument();
    });

    it('calls setIsMenuShown when settings button is clicked', async () => {
        const user = userEvent.setup();
        const setIsMenuShown = vi.fn();
        const { container } = render(
            <TrackerHeader {...defaultProps} setIsMenuShown={setIsMenuShown} />,
        );
        await user.click(
            container.querySelector('.upper-menu__settings-trigger'),
        );
        expect(setIsMenuShown).toHaveBeenCalledOnce();
    });
});
