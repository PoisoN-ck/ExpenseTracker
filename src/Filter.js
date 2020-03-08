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
        <button
          type="button"
          onClick={handleClick}
          data-value={typeof value === 'object' ? JSON.stringify(value) : value}
          key={`category_${index}`}
          className="filters__category button button--white button--round"
        >
          {name}
        </button>
      );
    });
  }

  return (
    <ul className="filters__category-group padding-vertical-sm">
      {getFilterItems(items)}
    </ul>
  )
}

Filter.propTypes = {
  items: PropTypes.arrayOf(PropTypes.oneOfType(
    [PropTypes.string, PropTypes.object, PropTypes.number],
  )).isRequired,
  setFilter: PropTypes.func.isRequired,
}

export default Filter
