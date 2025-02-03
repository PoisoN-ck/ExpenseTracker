import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CONSTANT_EXPENSE_FILTERS } from '../../../../constants';
import {
    ConstantExpense as ConstantExpenseType,
    FilteredConstantExpenses,
} from '../../../../types';
import Button from '../../../common/Button';
import ButtonIcon from '../../../common/ButtonIcon';
import ConstantExpense from './ConstantExpense';

const DEFAULT_CONSTANT_EXPENSE_STATE = {
    name: '',
    amount: '',
    category: '',
    id: '',
};

const [DEFAULT_FILTER] = CONSTANT_EXPENSE_FILTERS;

const ConstantExpenses = ({
    constantExpenses,
    isShown,
    addConstantExpense,
    editConstantExpense,
    deleteConstantExpense,
    filteredConstantExpense,
}) => {
    const [newConstantExpense, setNewConstantExpense] = useState(
        DEFAULT_CONSTANT_EXPENSE_STATE,
    );
    const [editedExpenses, setEditedExpenses] = useState([]);
    const [deletedExpenses, setDeletedExpenses] = useState([]);
    const [currentlyFilteredExpenses, setCurrentlyFilteredExpenses] =
        useState(constantExpenses);
    const [currentFilter, setCurrentFilter] = useState(DEFAULT_FILTER);

    const isConstantExpensesExist = currentlyFilteredExpenses.length > 0;

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

    const modifyChosenExpenseData = useCallback(
        (editedExpense) => {
            const currentExpense = currentlyFilteredExpenses.find(
                (constantExpene) => constantExpene.id === editedExpense.id,
            );

            if (currentExpense) {
                setEditedExpenses((editedExpensesState) => {
                    const stateWithoutOldExpense = editedExpensesState.filter(
                        (expense) => expense.id !== editedExpense.id,
                    );

                    return [...stateWithoutOldExpense, editedExpense];
                });
            }
        },
        [currentlyFilteredExpenses, setEditedExpenses],
    );

    const initiateEditExpense = (editedExpense) =>
        setEditedExpenses((editedExpensesState) => [
            ...editedExpensesState,
            editedExpense,
        ]);

    const undoEditExpense = (editedExpense) => {
        setEditedExpenses((editedExpensesState) => {
            const stateWithoutOldExpense = editedExpensesState.filter(
                (expense) => expense.id !== editedExpense.id,
            );

            return stateWithoutOldExpense;
        });
    };

    const initiateDeleteExpense = (deletedExpense) =>
        setDeletedExpenses((prevState) => [...prevState, deletedExpense]);

    const undoDeleteExpense = (deletedExpense) => {
        setDeletedExpenses((deletedExpensesState) => {
            const stateWithoutOldExpense = deletedExpensesState.filter(
                (expense) => expense.id !== deletedExpense.id,
            );

            return stateWithoutOldExpense;
        });
    };

    const isBeingCurrentlyEdited = (expenseId) =>
        !!editedExpenses.find(
            (editedExpense) => editedExpense.id === expenseId,
        );

    const handleDeleteExpense = async (expense) => {
        await deleteConstantExpense(expense);
    };

    const handleEditExpense = async (modifiedExpense) => {
        const editedExpense = editedExpenses.find(
            (expense) => expense.id === modifiedExpense.id,
        );

        if (editedExpense) {
            await editConstantExpense(editedExpense);
            setEditedExpenses((prevState) =>
                prevState.filter(
                    (expense) => expense.id !== modifiedExpense.id,
                ),
            );
        }
    };

    const handleFilterSelect = (filter) => setCurrentFilter(filter);

    useEffect(() => {
        if (currentFilter === DEFAULT_FILTER) {
            setCurrentlyFilteredExpenses(constantExpenses);

            return;
        }

        setCurrentlyFilteredExpenses(filteredConstantExpense[currentFilter]);
    }, [currentFilter, constantExpenses, filteredConstantExpense]);

    return (
        <div
            className={`menu-section ${
                isShown && 'section-shown'
            } flex-column flex-align-center`}
        >
            <div className="menu-subsection">
                <div className="margin-bottom-lg full-width">
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
                        <h4 className="text-muted margin-bottom-sm text-center">
                            Existing constant expenses
                        </h4>
                        {/* TODO: Move to separate component */}
                        <div className="full-width">
                            <ul className="flex flex-justify-space-between full-width">
                                {CONSTANT_EXPENSE_FILTERS.map((filter) => (
                                    <li
                                        className={`filter-constant-expense-container padding-vertical-sm text-center`}
                                        key={filter}
                                        onClick={() =>
                                            handleFilterSelect(filter)
                                        }
                                    >
                                        {filter}
                                    </li>
                                ))}
                            </ul>
                            <div
                                className="constant-expense-filter__selected margin-bottom-sm"
                                style={{
                                    transform: `translateX(${
                                        100 *
                                        CONSTANT_EXPENSE_FILTERS.indexOf(
                                            currentFilter,
                                        )
                                    }%)`,
                                }}
                            />
                        </div>
                        {/* TODO: Move to separate component */}
                        <ul className="flex-column full-width container__vertical-scroll">
                            {currentlyFilteredExpenses.map(
                                (constantExpense) => {
                                    const isCurrentlyBeingEdited =
                                        isBeingCurrentlyEdited(
                                            constantExpense.id,
                                        );
                                    const isDisabled = !isCurrentlyBeingEdited;
                                    const isToBeDeleted =
                                        !!deletedExpenses.find(
                                            (expense) =>
                                                expense.id ===
                                                constantExpense.id,
                                        );

                                    return (
                                        <li
                                            className="flex-center gap-10 margin-bottom-sm full-width constant-expense_container"
                                            key={constantExpense.id}
                                        >
                                            <ConstantExpense
                                                isDisabled={isDisabled}
                                                constantExpense={
                                                    constantExpense
                                                }
                                                setConstantExpense={
                                                    modifyChosenExpenseData
                                                }
                                            />
                                            <div className="flex-center-column gap-5">
                                                {isCurrentlyBeingEdited ? (
                                                    <ButtonIcon
                                                        icon="fas fa-check fa-xs"
                                                        handleClick={() =>
                                                            handleEditExpense(
                                                                constantExpense,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <ButtonIcon
                                                        icon="fa-solid fa-pen fa-xs"
                                                        handleClick={() =>
                                                            initiateEditExpense(
                                                                constantExpense,
                                                            )
                                                        }
                                                    />
                                                )}
                                                {isCurrentlyBeingEdited ? (
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
                                                            initiateDeleteExpense(
                                                                constantExpense,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={`flex-column flex-justify-center gap-10 constant-expense_delete-question text-center ${
                                                    isToBeDeleted &&
                                                    'delete-text-shown'
                                                }`}
                                            >
                                                <h5>
                                                    Delete expense{' '}
                                                    {`'${constantExpense.name}'`}
                                                    ?
                                                </h5>
                                                <div className="flex-center gap-10">
                                                    <ButtonIcon
                                                        icon="fas fa-check fa-xs"
                                                        handleClick={() =>
                                                            handleDeleteExpense(
                                                                constantExpense,
                                                            )
                                                        }
                                                    />
                                                    <ButtonIcon
                                                        icon="fa-solid fa-xmark fa-xs"
                                                        handleClick={() =>
                                                            undoDeleteExpense(
                                                                constantExpense,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </li>
                                    );
                                },
                            )}
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
    addConstantExpense: PropTypes.func.isRequired,
    editConstantExpense: PropTypes.func.isRequired,
    deleteConstantExpense: PropTypes.func.isRequired,
    filteredConstantExpense: FilteredConstantExpenses,
};

export default ConstantExpenses;
