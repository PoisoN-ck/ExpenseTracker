import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dropdown from './index';

const options = [
    <option key="a" value="A">
        Option A
    </option>,
    <option key="b" value="B">
        Option B
    </option>,
];

describe('Dropdown', () => {
    it('renders a select element', () => {
        render(
            <Dropdown
                options={options}
                handleSelect={vi.fn()}
                selectedValue="A"
            />,
        );
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows placeholder option by default', () => {
        render(
            <Dropdown
                options={options}
                handleSelect={vi.fn()}
                selectedValue=""
            />,
        );
        expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('shows custom placeholder', () => {
        render(
            <Dropdown
                options={options}
                handleSelect={vi.fn()}
                selectedValue=""
                placedholder="Pick one"
            />,
        );
        expect(screen.getByText('Pick one')).toBeInTheDocument();
    });

    it('calls handleSelect on change', async () => {
        const handleSelect = vi.fn();
        render(
            <Dropdown
                options={options}
                handleSelect={handleSelect}
                selectedValue="A"
            />,
        );
        await userEvent.selectOptions(screen.getByRole('combobox'), 'B');
        expect(handleSelect).toHaveBeenCalled();
    });

    it('is disabled when isDisabled=true', () => {
        render(
            <Dropdown
                options={options}
                handleSelect={vi.fn()}
                selectedValue=""
                isDisabled
            />,
        );
        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('renders provided options', () => {
        render(
            <Dropdown
                options={options}
                handleSelect={vi.fn()}
                selectedValue="A"
            />,
        );
        expect(
            screen.getByRole('option', { name: 'Option A' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('option', { name: 'Option B' }),
        ).toBeInTheDocument();
    });
});
