import React from 'react';
import PropTypes from 'prop-types';

function Transactions(props) {
  const { transactionsList } = props;

  function getTransaction(transaction, index) {
    const { value, category } = transaction;

    return (
      <li key={`transaction_${index}`}>
        {value > 0 ? 'Income ' : 'Expense '}
        {`${value} HUF, ${category}`}
      </li>
    )
  }

  return (
    <ul>
      {transactionsList.map(getTransaction)}
    </ul>
  )
}

Transactions.propTypes = {
  transactionsList: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Transactions
