import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransitionComponent from './index.jsx';

vi.mock('@mui/material', () => ({
    Slide: ({ children, direction, ...props }) => (
        <div data-testid="slide" data-direction={direction} {...props}>
            {children}
        </div>
    ),
}));

describe('TransitionComponent', () => {
    it('renders children inside a Slide', () => {
        render(
            <TransitionComponent in={true}>
                <div>inner content</div>
            </TransitionComponent>,
        );
        expect(screen.getByTestId('slide')).toBeInTheDocument();
        expect(screen.getByText('inner content')).toBeInTheDocument();
    });

    it('passes direction="right" to Slide', () => {
        render(
            <TransitionComponent in={true}>
                <div />
            </TransitionComponent>,
        );
        expect(screen.getByTestId('slide')).toHaveAttribute(
            'data-direction',
            'right',
        );
    });
});
