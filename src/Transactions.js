import React from 'react';
import PropTypes from 'prop-types';
import noTransactions from './img/no-transactions.svg';

function Transactions(props) {
  const { transactionsList } = props;

  function getTransaction(transaction, index) {
    const {
      value,
      category,
      transType,
      transDate,
    } = transaction;

    function convertToString(num) {
      return num.toLocaleString();
    }

    return (
      <li className="transactions__transaction transaction padding-vertical-sm" key={`transaction_${index}`}>
        <p className="transaction__header text-sm">
          <span>{category}</span>
          <span className={transType === 'Expense' ? 'expense' : 'profit'}>{`${convertToString(value)} HUF`}</span>
        </p>
        <p className="transaction__date text-xs text-bold">{new Date(transDate).toLocaleString()}</p>
      </li>
    )
  }

  return (
    <section className="transactions padding-vertical-sm">
      {transactionsList.length
        ? (
          <div className="container">
            <ul>
              {transactionsList.map(getTransaction)}
            </ul>
          </div>
        )
        : (
          <div className="transactions__no-transactions container">
            <img className="transactions__no-transactions-image" src={noTransactions} alt="No transactions" />
            <p className="transactions__no-transactions-text">No transactions to show... Why not to file one?</p>
          </div>
        )}
    </section>
  )
}

Transactions.propTypes = {
  transactionsList: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Transactions
