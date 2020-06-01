import React from 'react';
import PropTypes from 'prop-types';

function Balance(props) {
  const { balance, earnings, spendings } = props;

  function convertAmountToString(num) {
    return num.toLocaleString();
  }

  return (
    <div className="balance padding-vertical-lg">
      <div className="container balance__content">
        <div className="balance__header">
          <h1 className="balance__title text-sm text-uppercase">Overview</h1>
        </div>
        <div className="balance__info padding-vertical-lg">
          <h2 className="text-xs text-uppercase text-bold text-muted">Current balance</h2>
          <p className="balance__amount text-lg">{`${convertAmountToString(balance)} HUF`}</p>
        </div>
        <div className="balance__breakdown">
          <span className="balance__type">
            <p className="text-xs text-uppercase text-bold text-muted">Earnings</p>
            <p className="text-md">{convertAmountToString(earnings)}</p>
          </span>
          <span className="balance__vertical-line" />
          <span className="balance__type">
            <p className="text-xs text-uppercase text-bold text-muted">Spendings</p>
            <p className="text-md">{convertAmountToString(spendings)}</p>
          </span>
        </div>
      </div>
    </div>
  )
}

Balance.propTypes = {
  balance: PropTypes.number.isRequired,
  earnings: PropTypes.number.isRequired,
  spendings: PropTypes.number.isRequired,
};

export default Balance;
