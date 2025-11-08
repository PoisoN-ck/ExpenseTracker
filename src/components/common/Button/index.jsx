import PropTypes from 'prop-types';
import { INPUT_VARIANT_DICT } from '../../../constants';

// TODO: All buttons in the to be replaced with this component!
const Button = ({
    isDisabled,
    isRounded,
    style = '',
    text,
    variant = 'blue',
    handleClick,
    // mainly for useLongPress attributes
    ...otherProps
}) => {
    return (
        <button
            disabled={isDisabled}
            className={`button ${style} ${INPUT_VARIANT_DICT[variant]} ${
                isRounded && 'button--round'
            }`}
            type="button"
            onClick={handleClick}
            onContextMenu={(e) => e.preventDefault()}
            {...otherProps}
        >
            {text}
        </button>
    );
};

Button.propTypes = {
    isDisabled: PropTypes.bool,
    isRounded: PropTypes.bool,
    style: PropTypes.string,
    text: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(Object.keys(INPUT_VARIANT_DICT)),
    handleClick: PropTypes.func.isRequired,
};

export default Button;
