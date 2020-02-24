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

  return (
    <ul>
      {getItem(items)}
    </ul>
  )
}

Filter.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFilterCategory: PropTypes.func.isRequired,
}

export default Filter
