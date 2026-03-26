import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonIcon from './index';

describe('ButtonIcon', () => {
    it('renders a button', () => {
        render(<ButtonIcon icon="fa-solid fa-trash" handleClick={vi.fn()} />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders the icon element with the given class', () => {
        const { container } = render(
            <ButtonIcon icon="fa-solid fa-trash" handleClick={vi.fn()} />,
        );
        expect(
            container.querySelector('i.fa-solid.fa-trash'),
        ).toBeInTheDocument();
    });

    it('calls handleClick on click', async () => {
        const handleClick = vi.fn();
        render(
            <ButtonIcon icon="fa-solid fa-edit" handleClick={handleClick} />,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when isDisabled=true', () => {
        render(
            <ButtonIcon
                icon="fa-solid fa-trash"
                handleClick={vi.fn()}
                isDisabled
            />,
        );
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not fire click when disabled', async () => {
        const handleClick = vi.fn();
        render(
            <ButtonIcon
                icon="fa-solid fa-trash"
                handleClick={handleClick}
                isDisabled
            />,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies custom style class', () => {
        render(
            <ButtonIcon
                icon="fa-solid fa-trash"
                handleClick={vi.fn()}
                style="my-style"
            />,
        );
        expect(screen.getByRole('button').className).toContain('my-style');
    });
});
