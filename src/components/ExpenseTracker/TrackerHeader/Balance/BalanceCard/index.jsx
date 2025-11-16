import PropTypes from 'prop-types';

import { convertAmountToString } from '../../../../../utils';

const BalanceCard = ({ isShown, balance, showBalance, showHideNumbers }) => (
    <>
        <h2 className="text-xs text-uppercase text-bold text-muted">
            {balance.title}
        </h2>
        <button
            tabIndex={isShown ? 0 : -1}
            type="button"
            className="balance__amount text-lg button-no-style no-outline-on-focus"
            onClick={showHideNumbers}
        >{`${
            showBalance ? convertAmountToString(balance.value) : '••• •••'
        } HUF`}</button>
        <p className="text-sm text-muted">{balance?.subtitle}</p>
    </>
);

BalanceCard.propTypes = {
    isShown: PropTypes.bool.isRequired,
    balance: PropTypes.shape({
        title: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        subtitle: PropTypes.string,
    }).isRequired,
    showBalance: PropTypes.bool.isRequired,
    showHideNumbers: PropTypes.func.isRequired,
};

export default BalanceCard;
