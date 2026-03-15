import PropTypes from 'prop-types';
import { INPUT_SIZE_DICT } from '../../../constants';

const AmountInput = ({
    isDisabled = false,
    id = '',
    label = '',
    labelStyle = '',
    name = '',
    placeholder,
    size = 'default',
    style = '',
    value,
    handleChange,
}) => {
    const handleAmountChange = (event) => {
        const { value } = event.target;
        const convertedValue = Number(value);

        if (Number.isNaN(convertedValue)) return;

        if (convertedValue < 1) {
            handleChange('');
            return;
        }

        handleChange(convertedValue);
    };

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
                onChange={handleAmountChange}
            />
        </>
    );
};

AmountInput.propTypes = {
    isDisabled: PropTypes.bool,
    id: PropTypes.string,
    label: PropTypes.string,
    labelStyle: PropTypes.string,
    name: PropTypes.string,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(Object.keys(INPUT_SIZE_DICT)),
    style: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    handleChange: PropTypes.func.isRequired,
};

export default AmountInput;
