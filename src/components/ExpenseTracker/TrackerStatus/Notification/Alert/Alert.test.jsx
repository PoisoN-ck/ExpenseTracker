import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Alert from './index.jsx';

vi.mock('@mui/material/Alert', () => ({
    default: vi.fn(({ children, elevation, variant, ...rest }, ref) => (
        <div
            data-testid="mui-alert"
            data-elevation={elevation}
            data-variant={variant}
            ref={ref}
            {...rest}
        >
            {children}
        </div>
    )),
}));

describe('Alert', () => {
    it('returns a component via React.forwardRef', () => {
        const AlertComponent = Alert();
        expect(AlertComponent).toBeTruthy();
    });

    it('the returned component renders children', () => {
        const AlertComponent = /** @type {React.ElementType} */ (Alert());
        render(<AlertComponent severity="success">Test alert</AlertComponent>);
        expect(screen.getByTestId('mui-alert')).toBeInTheDocument();
        expect(screen.getByText('Test alert')).toBeInTheDocument();
    });

    it('passes elevation and variant to MuiAlert', () => {
        const AlertComponent = /** @type {React.ElementType} */ (Alert());
        render(<AlertComponent>content</AlertComponent>);
        const el = screen.getByTestId('mui-alert');
        expect(el).toHaveAttribute('data-elevation', '6');
        expect(el).toHaveAttribute('data-variant', 'filled');
    });
});
