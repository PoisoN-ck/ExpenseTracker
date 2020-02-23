import React, { Component } from 'react';
import MoneyRecord from './MoneyRecord';
import Category from './Category';

class Balance extends Component {

  constructor() {
    super();
    this.state = {
      balance: 10000,
      currentAmount: 0,
      currentCategory: this.categories.sort()[0],
      moneyFlow: [
        {value: 100, category: "salary"},
        {value: -20, category: "food"},
        {value: 300, category: "salary"},
        {value: -100, category: "clothes"}
      ]
    }
    this.addIncome = this.addIncome.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.setCurrentAmount = this.setCurrentAmount.bind(this);
    this.setCurrentCategory = this.setCurrentCategory.bind(this);
  }

  categories = [
    "food",
    "partying",
    "clothes",
    "flat",
    "self-care",
    "presents",
    "holidays",
    "fees",
    "salary"
  ]

  addIncome() {
    const {balance, currentAmount} = this.state;
    this.addMoneyFlow(currentAmount, "salary");
    this.setState({
      balance: balance + currentAmount,
      currentAmount: 0
    });
  }

  addExpense() {
    const {balance, currentAmount,  currentCategory} = this.state;
    this.addMoneyFlow(currentAmount * -1, currentCategory);
    this.setState({
      balance: balance - currentAmount,
      currentAmount: 0
    });
  }

  setCurrentAmount(event) {
    const {value} = event.target;

    if (isNaN(value)) {
      return;
    }

    this.setState({
      currentAmount: Number(value)
    });
  }

  setCurrentCategory(event) {
    const {value} = event.target;

    this.setState({
      currentCategory: value
    });
  }

  addMoneyFlow(value, category) {
    const {moneyFlow} = this.state;
    
    if (!value) return;

    this.setState({
      moneyFlow: [...moneyFlow, {value, category: category.charAt(0).toUpperCase() + category.slice(1)}]
    });
  }

  render() {
    const {balance, currentAmount, currentCategory, moneyFlow} = this.state;
    const {setCurrentAmount, setCurrentCategory, addIncome, addExpense, categories} = this;

    return (
      <React.Fragment>
        <h1>{balance} HUF</h1>
        <input onChange={setCurrentAmount} value={currentAmount}/>
        <select onChange={(e) => setCurrentCategory(e)}>
          {
            categories.sort().map(item => {
              return(
                <option value={item}>{item.charAt(0).toUpperCase() + item.slice(1)}</option>
              )
            })
          }
        </select>
        <button onClick={addIncome}>Add income</button>
        <button onClick={addExpense}>Reduce income</button>
        <ul>
          {
            moneyFlow.map((item, index) => {
              return (
                <MoneyRecord key={`value_${index}`} valueRecord={item.value} categoryRecord={item.category}/>
              )
            })
          }
        </ul>
      </React.Fragment>
    );
  }
}

export default Balance