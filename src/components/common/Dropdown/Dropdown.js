import PropTypes from 'prop-types';
import React from 'react';
import { INPUT_SIZE_DICT, INPUT_VARIANT_DICT } from '../../../constants';

const Dropdown = ({
    id,
    isDisabled,
    isRounded,
    name,
    size,
    style,
    variant = 'white',
    options,
    handleSelect,
    selectedValue,
}) => {
    return (
        <select
            disabled={isDisabled}
            className={`select-dropdown ${style} ${
                INPUT_VARIANT_DICT[variant]
            } ${isRounded && 'button--round'} ${INPUT_SIZE_DICT[size]}`}
            name={name}
            id={id}
            onChange={handleSelect}
            value={selectedValue}
        >
            <option>Select</option>
            {options}
        </select>
    );
};

Dropdown.propTypes = {
    id: PropTypes.string,
    isDisabled: PropTypes.bool,
    isRounded: PropTypes.bool,
    name: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.any),
    selectedValue: PropTypes.string,
    size: PropTypes.oneOf(Object.keys(INPUT_SIZE_DICT)),
    style: PropTypes.string,
    variant: PropTypes.oneOf([Object.keys(INPUT_VARIANT_DICT)]),
    handleSelect: PropTypes.func.isRequired,
};

export default Dropdown;
