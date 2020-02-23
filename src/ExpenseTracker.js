import React, { Component } from 'react';
import Balance from './Balance';
import Transactions from './Transactions';
import ActionBar from './ActionBar';

class ExpenseTracker extends Component {
  categories = [
    'food',
    'partying',
    'clothes',
    'flat',
    'self-care',
    'presents',
    'holidays',
    'fees',
  ]

  constructor() {
    super();
    this.state = {
      balance: 10000,
      currentAmount: 0,
      currentCategory: this.categories.sort()[0],
      transactions: [
        { value: 100, category: 'salary' },
        { value: -20, category: 'food' },
        { value: 300, category: 'salary' },
        { value: -100, category: 'clothes' },
      ],
    }
    this.addIncome = this.addIncome.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.setCurrentAmount = this.setCurrentAmount.bind(this);
    this.setCurrentCategory = this.setCurrentCategory.bind(this);
    this.getLastRecords = this.getLastRecords.bind(this);
  }

  setCurrentAmount(event) {
    const { value } = event.target;

    if (Number.isNaN(Number(value))) {
      return;
    }

    this.setState({
      currentAmount: Number(value),
    });
  }

  setCurrentCategory(category) {
    this.setState({
      currentCategory: category,
    });
  }

  getLastRecords(num) {
    const { transactions } = this.state;
    return transactions.slice(-num);
  }

  addTransactions(value, category) {
    const { transactions } = this.state;

    if (!value) return;

    this.setState({
      transactions: [...transactions, {
        value, category: category.charAt(0).toUpperCase() + category.slice(1),
      }],
    });
  }

  addExpense() {
    const { balance, currentAmount, currentCategory } = this.state;

    this.addTransactions(currentAmount * -1, currentCategory);

    this.setState({
      balance: balance - currentAmount,
      currentAmount: 0,
    });
  }

  addIncome() {
    const { balance, currentAmount } = this.state;

    this.addTransactions(currentAmount, 'Income');

    this.setState({
      balance: balance + currentAmount,
      currentAmount: 0,
    });
  }

  render() {
    const { balance, currentAmount } = this.state;

    const {
      setCurrentAmount,
      setCurrentCategory,
      getLastRecords,
      addIncome,
      addExpense,
      categories,
    } = this;

    return (
      <>
        <Balance balance={balance} />
        <ActionBar
          setCurrentAmount={setCurrentAmount}
          currentAmount={currentAmount}
          setCurrentCategory={setCurrentCategory}
          categories={categories}
          addIncome={addIncome}
          addExpense={addExpense}
        />
        <Transactions transactionsList={getLastRecords(10)} />
      </>
    );
  }
}

export default ExpenseTracker;
