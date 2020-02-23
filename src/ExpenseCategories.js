import React from 'react';
import PropTypes from 'prop-types';

function ExpenseCategories(props) {
  const { categories, setCategory } = props;

  function handleSelect(event) {
    const { value } = event.target;
    setCategory(value);
  }

  return (
    <select onBlur={handleSelect}>
      {
        categories.sort().map(
          (cat) => <option key={`${cat}_key`} value={cat}>{cat}</option>,
        )
      }
    </select>
  )
}

ExpenseCategories.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default ExpenseCategories
