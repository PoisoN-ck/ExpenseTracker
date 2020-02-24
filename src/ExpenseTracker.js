import React, { Component } from 'react';
import Balance from './Balance';
import Transactions from './Transactions';
import ActionBar from './ActionBar';
import Filter from './Filter';

class ExpenseTracker extends Component {
  categories = [
    'Food',
    'Partying',
    'Clothes',
    'Flat',
    'Self-care',
    'Presents',
    'Holidays',
    'Fees',
  ]

  constructor() {
    super();
    this.state = {
      balance: 10000,
      transactions: [
        { value: 100, category: 'Profit', transType: 'income' },
        { value: -20, category: 'Food', transType: 'expense' },
        { value: 300, category: 'Profit', transType: 'income' },
        { value: -100, category: 'Clothes', transType: 'expense' },
      ],
    }
    this.getLastRecords = this.getLastRecords.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
  }

  getLastRecords(num) {
    const { transactions } = this.state;
    return transactions.slice(-num);
  }

  addTransaction(transaction) {
    const { transactions, balance } = this.state;

    this.setState({
      balance: balance + transaction.value,
      transactions: [...transactions, transaction],
    });
  }

  render() {
    const { balance } = this.state;
    const { categories, getLastRecords, addTransaction } = this;

    return (
      <>
        <Balance balance={balance} />
        <ActionBar addTransaction={addTransaction} categories={categories} />
        <Filter categories={categories} />
        <Transactions transactionsList={getLastRecords(10)} />
      </>
    );
  }
}

export default ExpenseTracker;
