import PropTypes from 'prop-types';
import { TransCategory } from './TransCategory';
import { TransType } from './TransType';

export const Transaction = PropTypes.shape({
    category: TransCategory,
    id: PropTypes.string.isRequired,
    transDate: PropTypes.number.isRequired,
    transType: TransType,
    value: PropTypes.number.isRequired,
}).isRequired;
