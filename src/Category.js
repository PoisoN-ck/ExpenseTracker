import React from 'react';
import PropTypes from 'prop-types';

function Category(props) {
  const { categories, setCategory } = props;

  function handleSelect(event) {
    const { value } = event.target;
    setCategory(value);
  }

  return (
    <select onBlur={handleSelect}>
      {
        categories.sort().map(
          (cat) => <option key={`${cat}_key`} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>,
        )
      }
    </select>
  )
}

Category.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default Category
