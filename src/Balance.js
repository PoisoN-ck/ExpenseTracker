import React, { Component } from 'react';
import MoneyRecord from './MoneyRecord'

class Balance extends Component {

  constructor() {
    super();
    this.state = {
      balance: 10000,
      currentAmount: 0,
      moneyFlow: [100, -20, 300]
    }
    this.addIncome = this.addIncome.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.setCurrentAmount = this.setCurrentAmount.bind(this);
  }

  addIncome() {
    const {balance, currentAmount} = this.state;
    this.addMoneyFlow(currentAmount);
    this.setState({
      balance: balance + currentAmount,
      currentAmount: 0
    });
  }

  addExpense() {
    const {balance, currentAmount} = this.state;
    this.addMoneyFlow(currentAmount * -1);
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

  addMoneyFlow(value) {
    const {moneyFlow} = this.state;
    
    if (!value) return;

    this.setState({
      moneyFlow: [...moneyFlow, value]
    });
  }

  render() {
    const {balance, currentAmount, moneyFlow} = this.state;
    const {setCurrentAmount, addIncome, addExpense} = this;

    return (
      <React.Fragment>
        <h1>{balance} HUF</h1>
        <input onChange={setCurrentAmount} value={currentAmount}/>
        <button onClick={addIncome}>Add income</button>
        <button onClick={addExpense}>Reduce income</button>
        <ul>
          {
            moneyFlow.map((item, index) => {
              return (
                <MoneyRecord key={`value_${index}`} record={item}/>
              )
            })
          }
        </ul>
      </React.Fragment>
    );
  }
}

export default Balance