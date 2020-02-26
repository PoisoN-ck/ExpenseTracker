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
        {
          value: 100,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(Date.UTC(2020, 1, 2)),
        },
        {
          value: -20,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(Date.UTC(2020, 1, 3)),
        },
        {
          value: 300,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(Date.UTC(2020, 1, 4)),
        },
        {
          value: -100,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(Date.UTC(2020, 1, 5)),
        },
      ],
      filteredTransactions: [],
    }
    this.getLastRecords = this.getLastRecords.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.filterTransactions = this.filterTransactions.bind(this);
    this.setFilterByCategory = this.setFilterByCategory.bind(this);
    this.setFilterByType = this.setFilterByType.bind(this);
    this.setFilterByDate = this.setFilterByDate.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.getThisMonthExpenses = this.getThisMonthExpenses.bind(this);
    this.getThisMonthEarnings = this.getThisMonthEarnings.bind(this);
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

  getThisMonthExpenses() {
    const { filteredTransactions } = this.state;
    const currentMonth = new Date().getMonth();
    const expenses = filteredTransactions.filter(
      (transaction) => transaction.transType === 'Expense',
    ).filter((expense) => expense.timestamp.getMonth() === currentMonth)
      .map((filteredTransaction) => filteredTransaction.value * -1)
    return expenses.reduce((transaction, nextTransaction) => transaction + nextTransaction, 0);
  }

  getThisMonthEarnings() {
    const { filteredTransactions } = this.state;
    const currentMonth = new Date().getMonth();
    const expenses = filteredTransactions.filter(
      (transaction) => transaction.transType === 'Income',
    ).filter((expense) => expense.timestamp.getMonth() === currentMonth)
      .map((filteredTransaction) => filteredTransaction.value)
    return expenses.reduce((transaction, nextTransaction) => transaction + nextTransaction, 0);
  }

  setFilterByDate(timestamp) {
    this.filterTransactions('timestamp', timestamp);
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
      setFilterByDate,
      resetFilters,
      getThisMonthExpenses,
      getThisMonthEarnings,
    } = this;

    return (
      <>
        <Balance
          balance={balance}
          getThisMonthExpenses={getThisMonthExpenses}
          getThisMonthEarnings={getThisMonthEarnings}
        />
        <ActionBar addTransaction={addTransaction} categories={categories} />
        <Filter
          items={categories}
          setFilter={setFilterByDate}
          resetFilter={resetFilters}
        />
        <Filter
          items={['Last month', 'This month', 'Last week']}
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
