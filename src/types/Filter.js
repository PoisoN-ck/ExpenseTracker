import PropTypes from 'prop-types';

export const Filter = PropTypes.objectOf({
    category: PropTypes.arrayOf(PropTypes.string).isRequired,
    date: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.arrayOf(PropTypes.string).isRequired,
}).isRequired;
