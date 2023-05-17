import PropTypes from 'prop-types';
import { transactionTypes } from '../constants';

export const TransType = PropTypes.oneOf(transactionTypes).isRequired;
