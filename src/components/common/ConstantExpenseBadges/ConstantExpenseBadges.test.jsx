import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConstantExpenseBadges from './index';

describe('ConstantExpenseBadges', () => {
    it('renders nothing when neither isTemporary nor isMultiple', () => {
        const { container } = render(<ConstantExpenseBadges />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the Temporary badge when isTemporary=true', () => {
        render(<ConstantExpenseBadges isTemporary />);
        expect(screen.getByText('Temporary')).toBeInTheDocument();
    });

    it('renders the Multi badge when isMultiple=true', () => {
        render(<ConstantExpenseBadges isMultiple />);
        expect(screen.getByText('Multi')).toBeInTheDocument();
    });

    it('renders both badges when isTemporary and isMultiple are true', () => {
        render(<ConstantExpenseBadges isTemporary isMultiple />);
        expect(screen.getByText('Temporary')).toBeInTheDocument();
        expect(screen.getByText('Multi')).toBeInTheDocument();
    });

    it('applies second-badge class to Multi badge when isTemporary is also true', () => {
        render(<ConstantExpenseBadges isTemporary isMultiple />);
        expect(screen.getByText('Multi').className).toContain('second-badge');
    });

    it('does not apply second-badge class to Multi badge when isTemporary is false', () => {
        render(<ConstantExpenseBadges isMultiple />);
        expect(screen.getByText('Multi').className).not.toContain(
            'second-badge',
        );
    });
});
