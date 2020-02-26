import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ActionBar extends Component {
  constructor(props) {
    super()
    this.state = {
      selectedCategory: props.categories.sort()[0],
      transactionAmount: 0,
    }
    this.setCurrentAmount = this.setCurrentAmount.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.addIncome = this.addIncome.bind(this);
    this.handleSelectCategory = this.handleSelectCategory.bind(this);
  }

  get categoryOptions() {
    const { categories } = this.props;

    return categories.sort().map(
      (cat) => <option key={`${cat}_key`} value={cat}>{cat}</option>,
    )
  }

  setCurrentAmount(event) {
    const { value } = event.target;

    if (Number.isNaN(Number(value))) {
      return;
    }

    if (value < 0) return;

    this.setState({
      transactionAmount: Number(value),
    });
  }

  addExpense() {
    const { addTransaction } = this.props;
    const { transactionAmount, selectedCategory } = this.state;
    const transaction = {
      value: transactionAmount * -1,
      category: selectedCategory,
      transType: 'Expense',
      timestamp: new Date(),
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
      timestamp: new Date(),
    }

    /* pass transaction to ExpenseTracker through a method */
    addTransaction(transaction);

    this.setState({
      transactionAmount: 0,
    })
  }

  handleSelectCategory(event) {
    const { value: category } = event.target;

    this.setState({
      selectedCategory: category,
    });
  }

  render() {
    const { transactionAmount } = this.state;
    const {
      setCurrentAmount,
      addIncome,
      addExpense,
      handleSelectCategory,
      categoryOptions,
    } = this;

    return (
      <section>
        <input onChange={setCurrentAmount} value={transactionAmount} />
        <select onBlur={handleSelectCategory}>
          {categoryOptions}
        </select>
        <button type="button" onClick={addIncome}>Add income</button>
        <button type="button" onClick={addExpense}>Reduce income</button>
      </section>
    )
  }
}

ActionBar.propTypes = {
  addTransaction: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ActionBar
