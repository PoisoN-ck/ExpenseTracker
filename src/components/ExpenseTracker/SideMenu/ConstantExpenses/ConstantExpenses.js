import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConstantExpense as ConstantExpenseType } from '../../../../types';
import Button from '../../../common/Button';
import ButtonIcon from '../../../common/ButtonIcon';
import ConstantExpense from './ConstantExpense';

const DEFAULT_CONSTANT_EXPENSE_STATE = {
    name: '',
    amount: '',
    category: '',
    id: '',
};

const ConstantExpenses = ({
    constantExpenses,
    isShown,
    onAddExpense,
    // onEditExpense,
    // onDeleteExpense,
}) => {
    const [newConstantExpense, setNewConstantExpense] = useState(
        DEFAULT_CONSTANT_EXPENSE_STATE,
    );
    const [edittedExpenses, setEdittedExpenses] = useState([]);

    const isConstantExpensesExist = constantExpenses.length > 0;

    const handleAddConstantExpense = async () => {
        const newExpenseWithId = {
            ...newConstantExpense,
            id: uuidv4(),
        };
        const isExpenseAdded = await onAddExpense(newExpenseWithId);

        if (isExpenseAdded) {
            setNewConstantExpense(DEFAULT_CONSTANT_EXPENSE_STATE);
        }
    };

    const modifyChosenExpenseData = useCallback(
        (edittedExpense) => {
            const currentExpense = constantExpenses.find(
                (constantExpene) => constantExpene.id === edittedExpense.id,
            );

            if (currentExpense) {
                setEdittedExpenses((edittedExpensesState) => {
                    const stateWithoutOldExpense = edittedExpensesState.filter(
                        (expense) => expense.id !== edittedExpense.id,
                    );

                    return [...stateWithoutOldExpense, edittedExpense];
                });
            }
        },
        [constantExpenses, setEdittedExpenses],
    );

    const editExpense = (edittedExpense) =>
        setEdittedExpenses((edittedExpensesState) => [
            ...edittedExpensesState,
            edittedExpense,
        ]);

    const undoEditExpense = (edittedExpense) => {
        setEdittedExpenses((edittedExpensesState) => {
            const stateWithoutOldExpense = edittedExpensesState.filter(
                (expense) => expense.id !== edittedExpense.id,
            );

            return stateWithoutOldExpense;
        });
    };

    const isBeingCurrentlyEditted = (expenseId) =>
        !!edittedExpenses.find(
            (edittedExpense) => edittedExpense.id === expenseId,
        );

    return (
        <div
            className={`menu-section ${
                isShown && 'section-shown'
            } flex-column flex-align-center`}
        >
            <div className="menu-subsection">
                <div className="margin-bottom-md full-width">
                    <ConstantExpense
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
                {isConstantExpensesExist && (
                    <>
                        <h4 className="text-muted margin-bottom-md text-center">
                            Existing Constant Expenses
                        </h4>
                        <ul className="flex-column full-width">
                            {constantExpenses.map((constantExpense) => {
                                const isCurrentlyBeingEditted =
                                    isBeingCurrentlyEditted(constantExpense.id);
                                const isDisabled = !isCurrentlyBeingEditted;

                                return (
                                    <li
                                        className="flex-center gap-10 margin-bottom-sm full-width"
                                        key={constantExpense.id}
                                    >
                                        <ConstantExpense
                                            isDisabled={isDisabled}
                                            constantExpense={constantExpense}
                                            setConstantExpense={
                                                modifyChosenExpenseData
                                            }
                                        />
                                        <div className="flex-center-column gap-5">
                                            {isCurrentlyBeingEditted ? (
                                                <ButtonIcon
                                                    icon="fas fa-check fa-xs"
                                                    handleClick={() =>
                                                        undoEditExpense(
                                                            constantExpense,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <ButtonIcon
                                                    icon="fa-solid fa-pen fa-xs"
                                                    handleClick={() =>
                                                        editExpense(
                                                            constantExpense,
                                                        )
                                                    }
                                                />
                                            )}
                                            {isCurrentlyBeingEditted ? (
                                                <ButtonIcon
                                                    icon="fa-solid fa-xmark fa-xs"
                                                    handleClick={() =>
                                                        undoEditExpense(
                                                            constantExpense,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <ButtonIcon
                                                    icon="fa-solid fa-trash-can fa-xs"
                                                    handleClick={() =>
                                                        editExpense(
                                                            constantExpense,
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
};

ConstantExpenses.propTypes = {
    constantExpenses: PropTypes.arrayOf(ConstantExpenseType),
    isShown: PropTypes.bool.isRequired,
    onAddExpense: PropTypes.func,
    onEditExpense: PropTypes.func,
    onDeleteExpense: PropTypes.func,
};

export default ConstantExpenses;
