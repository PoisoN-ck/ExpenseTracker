import React from 'react'
import PropTypes from 'prop-types'

function Filter(props) {
  const { items } = props;

  function handleClick(event) {
    return props.setFilterCategory(event.target.textContent);
  }

  function getItem(itemsList) {
    return itemsList.map((item, index) => <li onClickCapture={handleClick} key={`category_${index}`}>{item}</li>)
  }

  function getFilteredTransactions() {
    const { filteredCategory, transactions } = props;

    const filteredTransactions = transactions.filter(
      (transaction) => transaction.category === filteredCategory,
    ).map((filteredCategoryObj) => filteredCategoryObj.value)

    console.log(filteredTransactions);

    return getItem(filteredTransactions);
  }

  return (
    <>
      <ul>
        {getItem(items)}
      </ul>
      <ul>
        {getFilteredTransactions()}
      </ul>
    </>
  )
}

Filter.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFilterCategory: PropTypes.func.isRequired,
  filteredCategory: PropTypes.string.isRequired,
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Filter
