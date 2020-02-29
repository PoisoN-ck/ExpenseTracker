import React from 'react';
import PropTypes from 'prop-types';

function Balance(props) {
  const { balance, earnings, spending } = props;

  return (
    <>
      <h1>
        {`${balance} HUF`}
      </h1>
      <h4>
        {`Earnings: ${earnings} Spendings: ${spending * -1}`}
      </h4>
    </>
  )
}

Balance.propTypes = {
  balance: PropTypes.number.isRequired,
  earnings: PropTypes.number.isRequired,
  spending: PropTypes.number.isRequired,
};

export default Balance;
