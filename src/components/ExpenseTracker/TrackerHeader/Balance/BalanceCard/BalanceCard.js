import React from 'react';

import PropTypes from 'prop-types';

import { convertAmountToString } from '../../../../../utils';

const BalanceCard = ({ balance, showBalance, showHideNumbers }) => (
    <>
        <h2 className="text-xs text-uppercase text-bold text-muted">
            {balance.title}
        </h2>
        <button
            type="button"
            className="balance__amount text-lg button-no-style no-outline-on-focus"
            onClick={showHideNumbers}
        >{`${
            showBalance ? convertAmountToString(balance.value) : '••• •••'
        } HUF`}</button>
    </>
);

BalanceCard.propTypes = {
    balance: PropTypes.number.isRequired,
    showBalance: PropTypes.func.isRequired,
    showHideNumbers: PropTypes.func.isRequired,
};

export default BalanceCard;
