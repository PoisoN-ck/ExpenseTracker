import React from 'react';
import PropTypes from 'prop-types';
import ExpenseCategories from './ExpenseCategories';

function ActionBar(props) {
  const {
    setCurrentAmount,
    currentAmount,
    categories,
    setCurrentCategory,
    addIncome,
    addExpense,
  } = props

  return (
    <section>
      <input onChange={setCurrentAmount} value={currentAmount} />
      <ExpenseCategories categories={categories} setCategory={setCurrentCategory} />
      <button type="button" onClick={addIncome}>Add income</button>
      <button type="button" onClick={addExpense}>Reduce income</button>
    </section>
  )
}

ActionBar.propTypes = {
  setCurrentAmount: PropTypes.func.isRequired,
  setCurrentCategory: PropTypes.func.isRequired,
  currentAmount: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  addIncome: PropTypes.func.isRequired,
  addExpense: PropTypes.func.isRequired,
};

export default ActionBar
