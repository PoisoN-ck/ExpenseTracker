import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BalanceCard from './index';

const makeBalance = (overrides = {}) => ({
    title: 'Current balance',
    value: 250000,
    ...overrides,
});

describe('BalanceCard', () => {
    it('renders the balance title', () => {
        render(
            <BalanceCard
                isShown
                balance={makeBalance()}
                showBalance={false}
                showHideNumbers={vi.fn()}
            />,
        );
        expect(screen.getByText('Current balance')).toBeInTheDocument();
    });

    it('hides amount behind dots when showBalance=false', () => {
        render(
            <BalanceCard
                isShown
                balance={makeBalance()}
                showBalance={false}
                showHideNumbers={vi.fn()}
            />,
        );
        expect(screen.getByText(/•••/)).toBeInTheDocument();
    });

    it('shows formatted amount when showBalance=true', () => {
        render(
            <BalanceCard
                isShown
                balance={makeBalance({ value: 1000 })}
                showBalance={true}
                showHideNumbers={vi.fn()}
            />,
        );
        expect(
            screen.getByText(new RegExp((1000).toLocaleString())),
        ).toBeInTheDocument();
    });

    it('calls showHideNumbers on click', async () => {
        const showHideNumbers = vi.fn();
        render(
            <BalanceCard
                isShown
                balance={makeBalance()}
                showBalance={false}
                showHideNumbers={showHideNumbers}
            />,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(showHideNumbers).toHaveBeenCalledTimes(1);
    });

    it('renders subtitle when provided', () => {
        render(
            <BalanceCard
                isShown
                balance={makeBalance({ subtitle: 'out of 5,000 HUF' })}
                showBalance={false}
                showHideNumbers={vi.fn()}
            />,
        );
        expect(screen.getByText('out of 5,000 HUF')).toBeInTheDocument();
    });
});
