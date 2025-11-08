import PropTypes from 'prop-types';
import React from 'react';

const ButtonIcon = ({ isDisabled, style = '', icon, handleClick }) => {
    return (
        <button
            disabled={isDisabled}
            className={`button-icon ${style}`}
            type="button"
            onClick={handleClick}
        >
            <i className={`main-color ${icon}`} />
        </button>
    );
};

ButtonIcon.propTypes = {
    isDisabled: PropTypes.bool,
    icon: PropTypes.string.isRequired,
    style: PropTypes.string,
    handleClick: PropTypes.func.isRequired,
};

export default ButtonIcon;
