import PropTypes from 'prop-types';

import { MULTIPLE_EXPENSE_TEXT, TEMPORARY_EXPENSE_TEXT } from '@constants';

const ConstantExpenseBadges = ({
    isMuted = false,
    isTemporary = false,
    isMultiple = false,
    isReversed = false,
}) => {
    const isShown = isTemporary || isMultiple;

    if (!isShown) return null;

    return (
        <div
            className={`constant-expense_badges-container ${isReversed ? ' constant-expense_badges-container--reversed' : ''}`}
        >
            {isTemporary && (
                <div
                    className={`constant-expense_badge ${isMuted && 'constant-expense_badge--muted'}`}
                >
                    {TEMPORARY_EXPENSE_TEXT}
                </div>
            )}
            {isMultiple && (
                <div
                    className={`constant-expense_badge ${isTemporary && 'second-badge'} ${isMuted && 'constant-expense_badge--muted'}`}
                >
                    {MULTIPLE_EXPENSE_TEXT}
                </div>
            )}
        </div>
    );
};

ConstantExpenseBadges.propTypes = {
    isTemporary: PropTypes.bool,
    isMultiple: PropTypes.bool,
    isMuted: PropTypes.bool,
    isReversed: PropTypes.bool,
};

export default ConstantExpenseBadges;
