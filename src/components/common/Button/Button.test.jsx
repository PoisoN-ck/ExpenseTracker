import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './index';

describe('Button', () => {
    it('renders with text', () => {
        render(<Button text="Click me" handleClick={vi.fn()} />);
        expect(
            screen.getByRole('button', { name: 'Click me' }),
        ).toBeInTheDocument();
    });

    it('calls handleClick on click', async () => {
        const handleClick = vi.fn();
        render(<Button text="Go" handleClick={handleClick} />);
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when isDisabled=true', () => {
        render(<Button text="Go" handleClick={vi.fn()} isDisabled />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies blue variant class by default', () => {
        render(<Button text="Go" handleClick={vi.fn()} />);
        expect(screen.getByRole('button').className).toContain('button--blue');
    });

    it('applies white variant class', () => {
        render(<Button text="Go" handleClick={vi.fn()} variant="white" />);
        expect(screen.getByRole('button').className).toContain('button--white');
    });

    it('applies rounded class by default', () => {
        render(<Button text="Go" handleClick={vi.fn()} />);
        expect(screen.getByRole('button').className).toContain('button--round');
    });

    it('does not apply rounded class when isRounded=false', () => {
        render(<Button text="Go" handleClick={vi.fn()} isRounded={false} />);
        expect(screen.getByRole('button').className).not.toContain(
            'button--round',
        );
    });

    it('does not fire click when disabled', async () => {
        const handleClick = vi.fn();
        render(<Button text="Go" handleClick={handleClick} isDisabled />);
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });
});
