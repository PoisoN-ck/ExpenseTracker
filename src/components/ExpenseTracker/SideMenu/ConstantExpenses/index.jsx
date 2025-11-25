import PropTypes from 'prop-types';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FilteredConstantExpenses } from '@types';
import Button from '@components/common/Button';
import ConstantExpense from './ConstantExpense';
import PlannedExpenseFilters from './PlannedExpenseFilters';
import ConstantExpensesList from './ConstantExpensesList';
import DayPicker from './DayPicker';

const DEFAULT_CONSTANT_EXPENSE_STATE = {
    name: '',
    amount: '',
    category: '',
    isOneTime: false,
    id: '',
};

const ConstantExpenses = ({
    isShown,
    addConstantExpense,
    editConstantExpense,
    deleteConstantExpense,
    filteredConstantExpense,
    doRegisterExpenseAsPaid,
}) => {
    // TODO: Implement Loader in this section
    const [newConstantExpense, setNewConstantExpense] = useState(
        DEFAULT_CONSTANT_EXPENSE_STATE,
    );
    const [currentlyFilteredExpenses, setCurrentlyFilteredExpenses] = useState(
        [],
    );

    const handleAddConstantExpense = async () => {
        const newExpenseWithId = {
            ...newConstantExpense,
            id: uuidv4(),
        };
        const isExpenseAdded = await addConstantExpense(newExpenseWithId);

        if (isExpenseAdded) {
            setNewConstantExpense(DEFAULT_CONSTANT_EXPENSE_STATE);
        }
    };

    return (
        <div
            className={`menu-section ${
                isShown && 'section-shown'
            } flex-column flex-align-center`}
        >
            <div className="menu-subsection">
                <div className="margin-bottom-lg full-width">
                    <ConstantExpense
                        isCreationMode
                        constantExpense={newConstantExpense}
                        setConstantExpense={setNewConstantExpense}
                    />
                    <Button
                        text="Add expense"
                        style="full-width"
                        isRounded
                        handleClick={handleAddConstantExpense}
                    />
                </div>
                <h4 className="text-muted margin-bottom-sm text-center">
                    Existing planned expenses
                </h4>
                <PlannedExpenseFilters
                    filteredConstantExpense={filteredConstantExpense}
                    setCurrentlyFilteredExpenses={setCurrentlyFilteredExpenses}
                />
                <ConstantExpensesList
                    currentlyFilteredExpenses={currentlyFilteredExpenses}
                    editConstantExpense={editConstantExpense}
                    deleteConstantExpense={deleteConstantExpense}
                    doRegisterExpenseAsPaid={doRegisterExpenseAsPaid}
                    filteredConstantExpense={filteredConstantExpense}
                />
                <DayPicker />
            </div>
        </div>
    );
};

ConstantExpenses.propTypes = {
    isShown: PropTypes.bool.isRequired,
    addConstantExpense: PropTypes.func.isRequired,
    editConstantExpense: PropTypes.func.isRequired,
    deleteConstantExpense: PropTypes.func.isRequired,
    filteredConstantExpense: FilteredConstantExpenses,
    doRegisterExpenseAsPaid: PropTypes.func,
};

export default ConstantExpenses;
