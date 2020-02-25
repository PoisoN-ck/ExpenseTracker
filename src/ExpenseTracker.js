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
      balance: 100000000,
      transactions: [
        { value: 100, category: 'Profit', transType: 'Income' },
        { value: -20, category: 'Food', transType: 'Expense' },
        { value: 300, category: 'Profit', transType: 'Income' },
        { value: -100, category: 'Clothes', transType: 'Expense' },
      ],
      filteredTransactions: [],
    }
    this.getLastRecords = this.getLastRecords.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.filterTransactions = this.filterTransactions.bind(this);
    this.setFilterByCategory = this.setFilterByCategory.bind(this);
    this.setFilterByType = this.setFilterByType.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
  }

  componentDidMount() {
    this.resetFilters();
  }

  componentDidUpdate(prevProps, prevState) {
    const { transactions: currentTransactions } = this.state;

    if (currentTransactions.length !== prevState.transactions.length) {
      this.resetFilters();
    }
  }

  getLastRecords(num) {
    const { filteredTransactions } = this.state;
    return filteredTransactions.slice(-num);
  }

  setFilterByCategory(category) {
    this.filterTransactions('category', category);
  }

  setFilterByType(type) {
    this.filterTransactions('transType', type);
  }

  filterTransactions(field, value) {
    const { transactions } = this.state;

    this.setState({
      filteredTransactions: transactions.filter((transaction) => transaction[field] === value),
    });
  }

  resetFilters() {
    const { transactions } = this.state;

    this.setState({
      filteredTransactions: transactions,
    })
  }

  addTransaction(transaction) {
    if (!transaction.value) return;

    const { transactions, balance } = this.state;

    this.setState({
      balance: balance + transaction.value,
      transactions: [...transactions, transaction],
    });
  }

  render() {
    const { balance } = this.state;
    const {
      categories,
      getLastRecords,
      addTransaction,
      setFilterByCategory,
      setFilterByType,
      resetFilters,
    } = this;

    return (
      <>
        <Balance balance={balance} />
        <ActionBar addTransaction={addTransaction} categories={categories} />
        <Filter
          items={categories}
          setFilter={setFilterByCategory}
          resetFilter={resetFilters}
        />
        <Filter
          items={['Income', 'Expense']}
          setFilter={setFilterByType}
          resetFilter={resetFilters}
        />
        <Transactions transactionsList={getLastRecords(10)} />
      </>
    );
  }
}

export default ExpenseTracker;
