import PropTypes from 'prop-types';
import { categories } from '../constants';

export const TransCategory = PropTypes.oneOf(categories).isRequired;
