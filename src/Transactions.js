import React from 'react';
import PropTypes from 'prop-types';

function Transactions(props) {
  const { transactionsList } = props;

  function getTransaction(transaction, index) {
    const {
      value,
      category,
      transType,
      timestamp,
    } = transaction;

    return (
      <li key={`transaction_${index}`}>
        {`${transType}: ${value} HUF, ${category}, ${timestamp.toLocaleString()}`}
      </li>
    )
  }

  return (
    <>
      <h2>Last transactions:</h2>
      <ul>
        {transactionsList.map(getTransaction)}
      </ul>
    </>
  )
}

Transactions.propTypes = {
  transactionsList: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Transactions
