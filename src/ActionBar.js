import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

class ActionBar extends Component {
  constructor() {
    super()
    this.state = {
      transactionAmount: '',
    }
    this.setCurrentAmount = this.setCurrentAmount.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.addIncome = this.addIncome.bind(this);
    this.handleAddTransaction = this.handleAddTransaction.bind(this);
  }

  get transactionCategories() {
    const { categories } = this.props;

    return categories.map(
      (category, index) => {
        return (
          <button
            key={`cat_button_${index}`}
            className="flex-list__item flex-list__item--lg button button--white button--round"
            type="button"
            data-category={category}
            onClick={this.addExpense}
          >
            {category}
          </button>
        )
      },
    )
  }

  setCurrentAmount(event) {
    const { value } = event.target;
    const convertedValue = Number(value);

    if (Number.isNaN(convertedValue)) {
      return;
    } else if (convertedValue < 1) {
      this.setState({
        transactionAmount: '',
      });
      return;
    }

    this.setState({
      transactionAmount: convertedValue,
    });
  }

  addExpense(event) {
    const { addTransaction, closeModal } = this.props;
    const { transactionAmount } = this.state;
    const { category } = event.target.dataset
    const transaction = {
      value: transactionAmount * -1,
      category,
      transType: 'Expense',
      transDate: new Date().getTime(),
    }

    addTransaction(transaction);

    this.setState({
      transactionAmount: '',
    });

    closeModal('addTransactionModal');
  }

  addIncome() {
    const { addTransaction, closeModal } = this.props;
    const { transactionAmount } = this.state;
    const transaction = {
      value: transactionAmount,
      category: 'Profit',
      transType: 'Income',
      transDate: new Date().getTime(),
    }

    addTransaction(transaction);

    this.setState({
      transactionAmount: '',
    });

    closeModal('addTransactionModal');
  }

  handleAddTransaction(event) {
    const { openModal } = this.props
    const { modal: modalName } = event.target.dataset;
    const { transactionAmount } = this.state;

    if (!transactionAmount) return;

    openModal(modalName);
  }

  render() {
    const { transactionAmount } = this.state;
    const { modals, closeModal } = this.props;
    const { addTransactionModal } = modals;
    const {
      setCurrentAmount,
      addIncome,
      transactionCategories,
      handleAddTransaction,
    } = this;

    return (
      <section className="action-bar padding-vertical-md">
        <div className="flex-center container">
          <input className="action-bar__input-field" onChange={setCurrentAmount} value={transactionAmount} placeholder="Enter the amount..." />
          <button className="action-bar__button button button--round button--blue" type="button" data-modal="addTransactionModal" onClick={handleAddTransaction}>Add</button>
          {addTransactionModal && (
            <Modal modalName="addTransactionModal" closeModal={closeModal} title="Choose category">
              <div className="flex-list">
                <button key="cat_button_income" className="flex-list__item flex-list__item--lg button button--white button--round action-bar__income-button" type="button" onClick={addIncome}>Income</button>
                {transactionCategories}
              </div>
            </Modal>
          )}
        </div>
      </section>
    )
  }
}

ActionBar.propTypes = {
  addTransaction: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  modals: PropTypes.oneOfType([PropTypes.object || PropTypes.bool]).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default ActionBar
