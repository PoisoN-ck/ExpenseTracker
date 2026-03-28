import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MultipleExpenseProgress from './index';

describe('MultipleExpenseProgress', () => {
    it('renders totalAmount with HUF label', () => {
        render(<MultipleExpenseProgress totalAmount={5000} />);
        expect(screen.getByText(/HUF/)).toBeInTheDocument();
    });

    it('displays formatted paidAmount and totalAmount', () => {
        render(
            <MultipleExpenseProgress paidAmount={1000} totalAmount={5000} />,
        );
        const text = screen.getByText(/HUF/).textContent;
        expect(text).toContain((1000).toLocaleString());
        expect(text).toContain((5000).toLocaleString());
    });

    it('defaults paidAmount to 0 when not provided', () => {
        render(<MultipleExpenseProgress totalAmount={3000} />);
        const text = screen.getByText(/HUF/).textContent;
        expect(text).toContain((0).toLocaleString());
    });

    it('does not apply muted class by default', () => {
        render(<MultipleExpenseProgress totalAmount={3000} />);
        const el = screen.getByText(/HUF/);
        expect(el.parentElement.className).not.toContain(
            'constant-expense__multiple-expense-badge--muted',
        );
    });

    it('applies muted class when isMuted=true', () => {
        render(<MultipleExpenseProgress totalAmount={3000} isMuted />);
        const el = screen.getByText(/HUF/);
        expect(el.parentElement.className).toContain(
            'constant-expense__multiple-expense-badge--muted',
        );
    });

    it('always has the base badge class', () => {
        render(<MultipleExpenseProgress totalAmount={3000} />);
        expect(screen.getByText(/HUF/).parentElement.className).toContain(
            'constant-expense__multiple-expense-badge',
        );
    });
});
