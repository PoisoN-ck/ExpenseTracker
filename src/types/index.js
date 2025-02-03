import PropTypes from 'prop-types';
import { categories, transactionTypes } from '../constants';

export const Filter = PropTypes.objectOf({
    category: PropTypes.arrayOf(PropTypes.string).isRequired,
    date: PropTypes.arrayOf(PropTypes.string).isRequired,
    type: PropTypes.arrayOf(PropTypes.string).isRequired,
}).isRequired;

export const TransCategory = PropTypes.oneOf(categories).isRequired;

export const TransType = PropTypes.oneOf(transactionTypes).isRequired;

export const Transaction = PropTypes.shape({
    category: TransCategory,
    id: PropTypes.string.isRequired,
    transDate: PropTypes.number.isRequired,
    transType: TransType,
    value: PropTypes.number.isRequired,
    constantExpenseId: PropTypes.string,
}).isRequired;

export const UserSetting = PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
});

export const ConstantExpense = PropTypes.shape({
    name: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        .isRequired,
    category: PropTypes.string.isRequired,
    id: PropTypes.string,
});

export const FilteredConstantExpenses = PropTypes.shape({
    Paid: PropTypes.arrayOf(ConstantExpense),
    'Not paid': PropTypes.arrayOf(ConstantExpense),
});
