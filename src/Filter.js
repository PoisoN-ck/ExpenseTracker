import React from 'react'
import PropTypes from 'prop-types'

function Filter(props) {
  const { items, setFilter, resetFilter } = props;

  function handleClick(event) {
    console.log(event.target.dataset.value);
    setFilter(event.target.dataset.value);
  }

  function getFilterItems(itemsList) {
    return itemsList.map((item, index) => {
      const value = typeof item === 'object' ? item.value : item;
      const name = typeof item === 'object' ? item.name : item;

      return (
        <li key={`category_${index}`}>
          <button type="button" onClick={handleClick} data-value={value}>{name}</button>
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
  items: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  setFilter: PropTypes.func.isRequired,
  resetFilter: PropTypes.func.isRequired,
}

export default Filter
