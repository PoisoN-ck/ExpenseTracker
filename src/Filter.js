import React from 'react'
import PropTypes from 'prop-types'

function Filter(props) {
  const { categories } = props;
  categories.push('All categories')
  console.log(categories);

  function getCategory(category, index) {
    return (
      <li key={`category_${index}`}>
        {category}
      </li>
    )
  }

  return (
    <ul>
      {categories.map(getCategory)}
    </ul>
  )
}

Filter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
}

export default Filter
