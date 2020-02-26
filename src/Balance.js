import React from 'react';
import PropTypes from 'prop-types';

function Balance(props) {
  const { balance, getThisMonthExpenses, getThisMonthEarnings } = props;

  return (
    <>
      <h1>
        {`${balance} HUF`}
      </h1>
      <h4>
        {`this months spendings: ${getThisMonthExpenses()}, this months earnings: ${getThisMonthEarnings()}`}
      </h4>
    </>
  )
}

Balance.propTypes = {
  balance: PropTypes.number.isRequired,
  getThisMonthExpenses: PropTypes.func.isRequired,
  getThisMonthEarnings: PropTypes.func.isRequired,
};

export default Balance;
