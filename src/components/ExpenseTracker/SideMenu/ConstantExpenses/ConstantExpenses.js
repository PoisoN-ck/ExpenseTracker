import PropTypes from 'prop-types';
import React, { useState } from 'react';
import Button from '../../../common/Button/Button';
import ConstantExpense from './ConstantExpense';

const DEFAULT_CONSTANT_EXPENSE_STATE = {
    name: '',
    amount: '',
    category: '',
    id: '',
};

const ConstantExpenses = ({
    isShown,
    onAddExpense,
    // onEditExpense,
    // onDeleteExpense,
}) => {
    const [newConstantExpense, setNewConstantExpense] = useState(
        DEFAULT_CONSTANT_EXPENSE_STATE,
    );
    const handleAddConstantExpense = async () =>
        await onAddExpense(newConstantExpense);

    return (
        <div
            className={`menu-section ${
                isShown && 'section-shown'
            } flex-column flex-align-center`}
        >
            <div className="menu-subsection">
                <div className="margin-bottom-md">
                    <ConstantExpense
                        constantExpense={newConstantExpense}
                        setConstantExpense={setNewConstantExpense}
                    />
                    <Button
                        text="Add expense"
                        style="text-sm full-width"
                        isRounded
                        handleClick={handleAddConstantExpense}
                    />
                </div>
                <h4 className="text-muted margin-bottom-md">
                    Existing Constant Expenses
                </h4>
                <ul className="flex-column">
                    <li>{/* <ConstantExpense /> */}</li>
                    <li>{/* <ConstantExpense /> */}</li>
                </ul>
            </div>
        </div>
    );
};

ConstantExpenses.propTypes = {
    isShown: PropTypes.bool.isRequired,
    onAddExpense: PropTypes.func,
    onEditExpense: PropTypes.func,
    onDeleteExpense: PropTypes.func,
};

export default ConstantExpenses;
