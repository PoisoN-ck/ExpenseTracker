import PropTypes from 'prop-types';

import { convertAmountToString } from '@utils';

const MultipleExpenseProgress = ({
    isMuted = false,
    paidAmount = 0,
    totalAmount,
}) => (
    <div
        className={`constant-expense__multiple-expense-badge text-sm text-white text-center ${isMuted ? 'constant-expense__multiple-expense-badge--muted' : ''}`}
    >
        <p>
            {convertAmountToString(paidAmount)}
            {' / '}
            {convertAmountToString(totalAmount)} HUF
        </p>
    </div>
);

MultipleExpenseProgress.propTypes = {
    isMuted: PropTypes.bool,
    paidAmount: PropTypes.number,
    totalAmount: PropTypes.number.isRequired,
};

export default MultipleExpenseProgress;
