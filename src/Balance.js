import React, { Component } from 'react';
import MoneyRecord from './MoneyRecord';
import Category from './Category';

class Balance extends Component {
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
      moneyFlow: [
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
    const { moneyFlow } = this.state;
    return moneyFlow.slice(-num);
  }

  get moneyRecords() {
    return this.getLastRecords(10).map(
      (item, index) => <MoneyRecord key={`val_${index}`} valueRecord={item.value} categoryRecord={item.category} />,
    )
  }

  addMoneyFlow(value, category) {
    const { moneyFlow } = this.state;

    if (!value) return;

    this.setState({
      moneyFlow: [...moneyFlow, {
        value, category: category.charAt(0).toUpperCase() + category.slice(1),
      }],
    });
  }

  addExpense() {
    const { balance, currentAmount, currentCategory } = this.state;

    this.addMoneyFlow(currentAmount * -1, currentCategory);

    this.setState({
      balance: balance - currentAmount,
      currentAmount: 0,
    });
  }

  addIncome() {
    const { balance, currentAmount } = this.state;

    this.addMoneyFlow(currentAmount, 'Salary');

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
      moneyRecords,
      addIncome,
      addExpense,
      categories,
    } = this;

    return (
      <>
        <h1>
          {`${balance} HUF`}
        </h1>
        <input onChange={setCurrentAmount} value={currentAmount} />
        <Category categories={categories} setCategory={setCurrentCategory} />
        <button type="button" onClick={addIncome}>Add income</button>
        <button type="button" onClick={addExpense}>Reduce income</button>
        <ul>
          { moneyRecords }
        </ul>
      </>
    );
  }
}

export default Balance;
