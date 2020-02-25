import React from 'react'
import PropTypes from 'prop-types'

function Filter(props) {
  const { items, setFilter, resetFilter } = props;

  function handleClick(event) {
    setFilter(event.target.textContent);
  }

  function getFilterItems(itemsList) {
    return itemsList.map((item, index) => {
      return (
        <li key={`category_${index}`}>
          <button type="button" onClick={handleClick}>{item}</button>
        </li>
      );
    });
  }

  function handleReset() {
    resetFilter();
  }

  return (
    <>
      <ul>
        <li>
          <button type="button" onClick={handleReset}>All</button>
        </li>
        {getFilterItems(items)}
      </ul>
    </>
  )
}

Filter.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  setFilter: PropTypes.func.isRequired,
  resetFilter: PropTypes.func.isRequired,
}

export default Filter
