import React, { Component } from 'react';

class Balance extends Component {

  constructor() {
    super();
    this.state = {
      balance: 100,
      currentAmount: 0,
      moneyFlow: []
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
    this.setState({
      moneyFlow: [...moneyFlow, value]
    });
  }

  render() {
    const {balance, currentAmount, moneyFlow} = this.state;
    const {setCurrentAmount, addIncome, addExpense} = this;

    return (
      <div>
        <h1>{balance}</h1>
        <ul>{
          moneyFlow.map((item, index) => {
            return (
              <li key={`value_${index}`}>{item}</li>
            )
          })
        }
        </ul>
        <input onChange={setCurrentAmount} value={currentAmount}/>
        <button onClick={addIncome}>Add income</button>
        <button onClick={addExpense}>Reduce income</button>
      </div>
    );
  }
}

export default Balance