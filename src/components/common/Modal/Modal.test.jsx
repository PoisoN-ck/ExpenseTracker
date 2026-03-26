import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './index';

describe('Modal', () => {
    const defaultProps = {
        title: 'Test Modal',
        closeModal: vi.fn(),
        children: <p>Modal body</p>,
    };

    it('renders title', () => {
        render(<Modal {...defaultProps} />);
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(<Modal {...defaultProps} />);
        expect(screen.getByText('Modal body')).toBeInTheDocument();
    });

    it('calls closeModal when close button is clicked', async () => {
        const closeModal = vi.fn();
        render(<Modal {...defaultProps} closeModal={closeModal} />);
        // close button has class "close-button"
        const closeBtn = document.querySelector('.close-button');
        await userEvent.click(closeBtn);
        expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it('applies contentClassName to content wrapper', () => {
        const { container } = render(
            <Modal {...defaultProps} contentClassName="custom-class" />,
        );
        expect(
            container.querySelector('.modal__content.custom-class'),
        ).toBeInTheDocument();
    });
});
