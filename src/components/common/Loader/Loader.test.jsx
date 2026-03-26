// SVG imports are mocked via vite.config.js test.alias or inline here
vi.mock('@img/loading.svg', () => ({ default: 'loading.svg' }));

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loader from './index';

describe('Loader – standalone (no children)', () => {
    it('renders the app heading', () => {
        render(<Loader isLoading />);
        expect(screen.getByText('trakkex')).toBeInTheDocument();
    });

    it('renders the loader image', () => {
        render(<Loader isLoading />);
        expect(screen.getByAltText('Loader')).toBeInTheDocument();
    });
});

describe('Loader – with children', () => {
    it('shows loader overlay when isLoading=true', () => {
        const { container } = render(
            <Loader isLoading>
                <p>Content</p>
            </Loader>,
        );
        expect(container.querySelector('.loader')).toBeInTheDocument();
        expect(screen.getByAltText('Loader')).toBeInTheDocument();
    });

    it('shows children when isLoading=false', () => {
        render(
            <Loader isLoading={false}>
                <p>Content</p>
            </Loader>,
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not show loader image when isLoading=false', () => {
        render(
            <Loader isLoading={false}>
                <p>Content</p>
            </Loader>,
        );
        expect(screen.queryByAltText('Loader')).not.toBeInTheDocument();
    });
});
