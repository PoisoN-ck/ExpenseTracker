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
      filteredCategory: '',
      currentTransactionType: '',
      transactions: [
        { value: 100, category: 'Profit', transType: 'Income' },
        { value: -20, category: 'Food', transType: 'Expense' },
        { value: 300, category: 'Profit', transType: 'Income' },
        { value: -100, category: 'Clothes', transType: 'Expense' },
      ],
    }
    this.getLastRecords = this.getLastRecords.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.addToCategories = this.addToCategories.bind(this);
    this.setFilterCategory = this.setFilterCategory.bind(this);
    this.getFilteredItems = this.getFilteredItems.bind(this);
    this.setFilterByType = this.setFilterByType.bind(this);
  }

  getLastRecords(num) {
    const { transactions } = this.state;
    return transactions.slice(-num);
  }

  setFilterCategory(list, category) {
    let { filteredCategory } = this.state;

    filteredCategory = list.find((item) => category === item);

    this.setState({
      filteredCategory,
      currentTransactionType: '',
    })
  }

  setFilterByType(list, type) {
    let { currentTransactionType } = this.state;

    currentTransactionType = list.find((item) => type === item);

    this.setState({
      currentTransactionType,
      filteredCategory: '',
    })
  }

  getFilteredItems() {
    const { filteredCategory, currentTransactionType, transactions } = this.state;

    if (currentTransactionType || filteredCategory === 'All Categories') {
      const transactionType = currentTransactionType === 'Income' ? 'Income' : 'Expense';

      const filteredTransactions = transactions.filter(
        (transaction) => transaction.transType === transactionType,
      ).map((filteredCategoryObj) => `${filteredCategoryObj.value} HUF`)

      return filteredTransactions;
    }

    const filteredTransactions = transactions.filter(
      (transaction) => transaction.category === filteredCategory,
    ).map((filteredCategoryObj) => `${filteredCategoryObj.value} HUF`)

    return filteredTransactions;
  }

  addTransaction(transaction) {
    const { transactions, balance } = this.state;

    this.setState({
      balance: balance + transaction.value,
      transactions: [...transactions, transaction],
    });
  }

  addToCategories(category) {
    const { categories } = this
    return [...categories, category].sort();
  }


  render() {
    const { balance } = this.state;
    const {
      categories,
      getLastRecords,
      addTransaction,
      addToCategories,
      setFilterCategory,
      getFilteredItems,
      setFilterByType,
    } = this;

    return (
      <>
        <Balance balance={balance} />
        <ActionBar addTransaction={addTransaction} categories={categories} />
        <Filter
          items={addToCategories('All Categories')}
          setFilter={setFilterCategory}
        />
        <Filter
          items={['Income', 'Expense']}
          setFilter={setFilterByType}
        />
        <ul>
          {getFilteredItems()}
        </ul>
        <Transactions transactionsList={getLastRecords(10)} />
      </>
    );
  }
}

export default ExpenseTracker;
