import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoDataScreen from './index';

vi.mock('../../../img/no-transactions.svg', () => ({
    default: 'no-transactions.svg',
}));

describe('NoDataScreen', () => {
    it('renders the message text', () => {
        render(<NoDataScreen text="Nothing here" />);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders the illustration image', () => {
        render(<NoDataScreen text="Nothing here" />);
        expect(screen.getByAltText('No data to show')).toBeInTheDocument();
    });

    it('applies custom style class to container', () => {
        const { container } = render(
            <NoDataScreen text="Empty" style="my-class" />,
        );
        expect(
            /** @type {HTMLElement} */ (container.firstChild).classList,
        ).toContain('my-class');
    });
});
