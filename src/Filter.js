import React from 'react'
import PropTypes from 'prop-types'

function Filter(props) {
  const {
    items,
    setFilter,
    filterName,
    activeFilters,
  } = props;

  function handleClick(event) {
    setFilter({ name: filterName, value: event.target.dataset.value });
  }

  function getFilterItems(itemsList) {
    return itemsList.map((item, index) => {
      let value = typeof item === 'object' ? item.value : item;
      const name = typeof item === 'object' ? item.name : item;
      value = typeof value === 'object' ? JSON.stringify(value) : value

      return (
        <button
          type="button"
          onClick={handleClick}
          data-value={value}
          key={`category_${index}`}
          className={`filters__category button button--round ${activeFilters.includes(value) ? 'button--blue' : 'button--white'}`}
        >
          {name}
        </button>
      );
    });
  }

  return (
    <ul className="filters__category-group">
      {getFilterItems(items)}
    </ul>
  )
}

Filter.propTypes = {
  filterName: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.oneOfType(
    [PropTypes.string, PropTypes.object, PropTypes.number],
  )).isRequired,
  setFilter: PropTypes.func.isRequired,
  activeFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default Filter
