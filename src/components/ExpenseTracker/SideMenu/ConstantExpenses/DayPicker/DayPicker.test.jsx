import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DayPicker } from './index.jsx';

const mockUpdatePlannedExpenseDayRefresh = vi.fn();

vi.mock('@context/ConstantExpensesContext', () => ({
    useConstantExpensesContext: () => ({
        plannedExpenseDayRefresh: '1',
        updatePlannedExpenseDayRefresh: mockUpdatePlannedExpenseDayRefresh,
    }),
}));

vi.mock('@components/common/Button', () => ({
    default: ({ text, handleClick, id, style: _style, ...rest }) => (
        <button id={id} onClick={handleClick} {...rest}>
            {text}
        </button>
    ),
}));

describe('DayPicker', () => {
    beforeEach(() => {
        mockUpdatePlannedExpenseDayRefresh.mockReset();
        mockUpdatePlannedExpenseDayRefresh.mockResolvedValue(true);
    });

    it('renders the toggle button', () => {
        render(<DayPicker />);
        expect(
            screen.getByRole('button', {
                name: /planned expense refresh day/i,
            }),
        ).toBeInTheDocument();
    });

    it('shows "Planned expense refresh day" label', () => {
        render(<DayPicker />);
        expect(
            screen.getByText(/planned expense refresh day/i),
        ).toBeInTheDocument();
    });

    it('hides the day grid by default', () => {
        const { container } = render(<DayPicker />);
        expect(container.querySelector('.daypicker')).toHaveClass('hidden');
    });

    it('shows the day grid after clicking the toggle button', async () => {
        const user = userEvent.setup();
        const { container } = render(<DayPicker />);
        await user.click(container.querySelector('[data-daypicker-toggle]'));
        expect(container.querySelector('.daypicker')).not.toHaveClass('hidden');
    });

    it('renders 31 day cells inside the grid', async () => {
        const user = userEvent.setup();
        const { container } = render(<DayPicker />);
        await user.click(container.querySelector('[data-daypicker-toggle]'));
        const cells = screen.getAllByRole('gridcell');
        expect(cells).toHaveLength(31);
    });

    it('calls updatePlannedExpenseDayRefresh when a day cell is clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(<DayPicker />);
        await user.click(container.querySelector('[data-daypicker-toggle]'));
        const dayCells = container.querySelectorAll('[role="gridcell"]');
        await user.click(dayCells[4]); // day 5
        expect(mockUpdatePlannedExpenseDayRefresh).toHaveBeenCalledWith(5);
    });

    it('marks the current plannedExpenseDayRefresh cell as selected', async () => {
        const user = userEvent.setup();
        const { container } = render(<DayPicker />);
        await user.click(container.querySelector('[data-daypicker-toggle]'));
        const selectedCell = container.querySelector('[aria-pressed="true"]');
        expect(selectedCell).toBeInTheDocument();
        expect(selectedCell).toHaveAttribute('aria-label', 'Day 1');
    });

    it('hides the grid after selecting a day', async () => {
        const user = userEvent.setup();
        const { container } = render(<DayPicker />);
        await user.click(container.querySelector('[data-daypicker-toggle]'));
        const dayCells = container.querySelectorAll('[role="gridcell"]');
        await user.click(dayCells[0]);
        expect(container.querySelector('.daypicker')).toHaveClass('hidden');
    });
});
