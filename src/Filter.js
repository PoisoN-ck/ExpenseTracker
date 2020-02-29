import React from 'react'
import PropTypes from 'prop-types'

function Filter(props) {
  const { items, setFilter } = props;

  function handleClick(event) {
    setFilter(event.target.dataset.value);
  }

  function getFilterItems(itemsList) {
    return itemsList.map((item, index) => {
      const value = typeof item === 'object' ? item.value : item;
      const name = typeof item === 'object' ? item.name : item;

      return (
        <li key={`category_${index}`}>
          <button
            type="button"
            onClick={handleClick}
            data-value={typeof value === 'object' ? JSON.stringify(value) : value}
          >
            {name}
          </button>
        </li>
      );
    });
  }

  return (
    <>
      <ul>
        {getFilterItems(items)}
      </ul>
    </>
  )
}

Filter.propTypes = {
  items: PropTypes.arrayOf(PropTypes.oneOfType(
    [PropTypes.string, PropTypes.object, PropTypes.number],
  )).isRequired,
  setFilter: PropTypes.func.isRequired,
}

export default Filter
