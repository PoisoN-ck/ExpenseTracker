import PropTypes from 'prop-types';
import { INPUT_SIZE_DICT } from '../../../constants';

// TODO: All inputs in the to be replaced with this component!
const TextInput = ({
    isDisabled = false,
    id = '',
    label = '',
    labelStyle = '',
    name = '',
    placeholder,
    size,
    style = '',
    value,
    handleChange,
}) => {
    return (
        <>
            {label && (
                <label htmlFor={id} className={`menu-label ${labelStyle}`}>
                    {label}
                </label>
            )}
            <input
                disabled={isDisabled}
                className={`input-field ${style} ${INPUT_SIZE_DICT[size]}`}
                name={name}
                id={id}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </>
    );
};

TextInput.propTypes = {
    isDisabled: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.string,
    labelStyle: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(Object.keys(INPUT_SIZE_DICT)),
    style: PropTypes.string,
    value: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
};

export default TextInput;
