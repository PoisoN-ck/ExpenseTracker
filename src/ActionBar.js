import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ExpenseCategories from './ExpenseCategories';

class ActionBar extends Component {
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
    super()
    this.state = {
      selectedCategory: this.categories.sort()[0],
      transactionAmount: 0,
    }
    this.setCurrentAmount = this.setCurrentAmount.bind(this);
    this.setCurrentCategory = this.setCurrentCategory.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.addIncome = this.addIncome.bind(this);
  }

  setCurrentAmount(event) {
    const { value } = event.target;

    if (Number.isNaN(Number(value))) {
      return;
    }

    this.setState({
      transactionAmount: Number(value),
    });
  }

  setCurrentCategory(category) {
    this.setState({
      selectedCategory: category,
    });
  }

  addExpense() {
    const { addTransaction } = this.props;
    const { transactionAmount, selectedCategory } = this.state;
    const transaction = {
      value: transactionAmount * -1,
      category: selectedCategory,
      transType: 'Expense',
    }

    addTransaction(transaction);

    this.setState({
      transactionAmount: 0,
    })
  }

  addIncome() {
    const { addTransaction } = this.props;
    const { transactionAmount } = this.state;
    const transaction = {
      value: transactionAmount,
      category: 'Profit',
      transType: 'Income',
    }

    /* pass transaction to ExpenseTracker through a method */
    addTransaction(transaction);

    this.setState({
      transactionAmount: 0,
    })
  }

  render() {
    const { transactionAmount } = this.state;
    const {
      setCurrentAmount,
      setCurrentCategory,
      categories,
      addIncome,
      addExpense,
    } = this;

    return (
      <section>
        <input onChange={setCurrentAmount} value={transactionAmount} />
        <ExpenseCategories categories={categories} setCategory={setCurrentCategory} />
        <button type="button" onClick={addIncome}>Add income</button>
        <button type="button" onClick={addExpense}>Reduce income</button>
      </section>
    )
  }
}

ActionBar.propTypes = {
  addTransaction: PropTypes.func.isRequired,
};

export default ActionBar
