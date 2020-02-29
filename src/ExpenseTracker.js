import React, { Component } from 'react';
import { subMonths, startOfMonth, startOfWeek, subWeeks, isWithinRange } from 'date-fns';
import Balance from './Balance';
import Transactions from './Transactions';
import ActionBar from './ActionBar';
import Filter from './Filter';

class ExpenseTracker extends Component {
  currentDate = new Date();

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

  datesFilters = [
    {
      name: 'Previous Month',
      value: {
        startDate: startOfMonth(subMonths(this.currentDate, 1)),
        endDate: startOfMonth(this.currentDate),
      },
    },
    {
      name: 'Current Month',
      value: {
        startDate: startOfMonth(this.currentDate),
        endDate: startOfMonth(subMonths(this.currentDate, -1)),
      },
    },
    {
      name: 'This Week',
      value: {
        startDate: startOfWeek(this.currentDate, { weekStartsOn: 1 }),
        endDate: this.currentDate,
      },
    },
    {
      name: 'Last Week',
      value: {
        startDate: subWeeks(startOfWeek(this.currentDate, { weekStartsOn: 1 }), 1),
        endDate: startOfWeek(this.currentDate, { weekStartsOn: 1 }),
      },
    },
  ]

  typeFilters = ['Income', 'Expense']

  constructor() {
    super();
    this.state = {
      balance: 100000000,
      transactions: [
        {
          value: 100,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 0, 1, 0, 0, 0),
        },
        {
          value: -20,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(2020, 0, 31, 23, 59, 59),
        },
        {
          value: 300,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 3, 23, 0, 0),
        },
        {
          value: -100,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 5),
        },
        {
          value: -10000,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 29, 11, 0, 0),
        },
        {
          value: 370000,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 24, 7, 0, 0),
        },
        {
          value: 100000,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 18, 7, 0, 0),
        },
        {
          value: 5000,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 18, 7, 0, 0),
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
    this.getTransactionsBalance = this.getTransactionsBalance.bind(this);
  }

  componentDidMount() {
    this.resetFilters();
  }

  getLastRecords(num) {
    const { filteredTransactions } = this.state;
    return filteredTransactions.slice(-num);
  }

  getTransactionsBalance() {
    const { filteredTransactions } = this.state;

    const result = {};

    filteredTransactions.forEach((transaction) => {
      result[transaction.transType] = (
        result[transaction.transType] ? result[transaction.transType] : 0) + transaction.value;
    });

    return result;
  }

  setFilterByDate(datesInterval) {
    const { transactions } = this.state;
    const { startDate, endDate } = JSON.parse(datesInterval);

    this.setState({
      filteredTransactions: transactions.filter(
        (transaction) => isWithinRange(transaction.timestamp, startDate, endDate),
      ),
    })
  }

  setFilterByCategory(category) {
    this.filterTransactions('category', category);
  }

  setFilterByType(type) {
    this.filterTransactions('transType', type);
  }

  filterTransactions(field, value) {
    const { transactions } = this.state;
    const filteredTransactions = transactions.filter(
      (transaction) => transaction[field] === value,
    );

    this.setState({ filteredTransactions });
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
    }, this.resetFilters);
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
      getTransactionsBalance,
      datesFilters,
      typeFilters,
    } = this;

    const balances = getTransactionsBalance();

    return (
      <>
        <Balance
          balance={balance}
          earnings={balances.Income ? balances.Income : 0}
          spending={balances.Expense ? balances.Expense : 0}
        />
        <ActionBar addTransaction={addTransaction} categories={categories} />
        <button type="button" onClick={resetFilters}>Reset filters</button>
        <Filter items={categories} setFilter={setFilterByCategory} />
        <Filter items={datesFilters} setFilter={setFilterByDate} />
        <Filter items={typeFilters} setFilter={setFilterByType} />
        <Transactions transactionsList={getLastRecords(10)} />
      </>
    );
  }
}

export default ExpenseTracker;
