import PropTypes from 'prop-types';
import React from 'react';

function Filter({ items, setFilter, filterName, activeFilters }) {
    const handleClick = (e) => {
        setFilter({ name: filterName, value: e.target.dataset.value });
    };

    const filterItems = items.map((item, index) => {
        const value =
            typeof item === 'object' ? JSON.stringify(item.value) : item;
        const name = typeof item === 'object' ? item.name : item;

        return (
            <button
                type="button"
                onClick={handleClick}
                data-value={value}
                key={`category_${index}`}
                className={`filters__category button button--round ${
                    activeFilters.includes(value)
                        ? 'button--blue'
                        : 'button--white'
                }`}
            >
                {name}
            </button>
        );
    });

    return <ul className="filters__category-group">{filterItems}</ul>;
}

Filter.propTypes = {
    filterName: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
            PropTypes.number,
        ]),
    ).isRequired,
    setFilter: PropTypes.func.isRequired,
    activeFilters: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Filter;
