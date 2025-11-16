import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CONSTANT_EXPENSE_FILTERS } from '../../../../../constants';
import {
    ConstantExpense as ConstantExpenseType,
    FilteredConstantExpenses,
} from '../../../../../types';

const [DEFAULT_FILTER] = CONSTANT_EXPENSE_FILTERS;

const PlannedExpenseFilters = ({
    constantExpenses,
    filteredConstantExpense,
    setCurrentlyFilteredExpenses,
}) => {
    const [currentFilter, setCurrentFilter] = useState(DEFAULT_FILTER);

    const handleFilterSelect = (filter) => setCurrentFilter(filter);

    useEffect(() => {
        if (currentFilter === DEFAULT_FILTER) {
            setCurrentlyFilteredExpenses(constantExpenses);

            return;
        }

        setCurrentlyFilteredExpenses(filteredConstantExpense[currentFilter]);
    }, [currentFilter, constantExpenses, filteredConstantExpense]);

    return (
        <div className="full-width">
            <ul className="flex flex-justify-space-between full-width">
                {CONSTANT_EXPENSE_FILTERS.map((filter) => (
                    <li
                        className="filter-constant-expense-container padding-vertical-sm text-center"
                        key={filter}
                        onClick={() => handleFilterSelect(filter)}
                    >
                        {filter}
                    </li>
                ))}
            </ul>
            <div
                className="constant-expense-filter__selected margin-bottom-sm"
                style={{
                    transform: `translateX(${
                        100 * CONSTANT_EXPENSE_FILTERS.indexOf(currentFilter)
                    }%)`,
                }}
            />
        </div>
    );
};

PlannedExpenseFilters.propTypes = {
    constantExpenses: PropTypes.arrayOf(ConstantExpenseType),
    filteredConstantExpense: FilteredConstantExpenses,
    setCurrentlyFilteredExpenses: PropTypes.func,
};

export default PlannedExpenseFilters;
