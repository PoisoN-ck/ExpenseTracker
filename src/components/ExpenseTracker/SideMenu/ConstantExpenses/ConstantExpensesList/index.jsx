import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { convertAmountToString } from '@utils';
import {
    FilteredConstantExpenses,
    ConstantExpense as ConstantExpenseType,
} from '@types';
import NoDataScreen from '@components/common/NoDataScreen';
import ButtonIcon from '@components/common/ButtonIcon';
import { PAID } from '@constants';
import ConstantExpense from '../ConstantExpense';

const ConstantExpensesList = ({
    currentlyFilteredExpenses,
    editConstantExpense,
    deleteConstantExpense,
    doRegisterExpenseAsPaid,
    filteredConstantExpense,
}) => {
    const [editedExpenses, setEditedExpenses] = useState([]);
    const [deletedExpenses, setDeletedExpenses] = useState([]);
    const [markedAsPaidExpenseId, setMarkedAsPaidExpenseId] = useState();

    const isConstantExpensesExist = currentlyFilteredExpenses.length > 0;

    const totalFilteredExpenses = currentlyFilteredExpenses.reduce(
        (total, expense) => total + expense.amount,
        0,
    );

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

    const handleMarkAsPaid = (expenseId) => setMarkedAsPaidExpenseId(expenseId);
    const handleUndoMarkAsPaid = () => setMarkedAsPaidExpenseId(null);
    const handleRegisterAsPaid = async (expense) => {
        await doRegisterExpenseAsPaid(expense);

        handleUndoMarkAsPaid();
    };

    return (
        <>
            <p className="text-muted">
                Total: {convertAmountToString(totalFilteredExpenses)} HUF
            </p>
            {isConstantExpensesExist ? (
                <ul className="flex-column full-width container__vertical-scroll bottom-border__main-color margin-bottom-md">
                    {currentlyFilteredExpenses.map((constantExpense) => {
                        const isCurrentlyBeingEdited = isBeingCurrentlyEdited(
                            constantExpense.id,
                        );
                        const isDisabled = !isCurrentlyBeingEdited;
                        const isToBeDeleted = !!deletedExpenses.find(
                            (expense) => expense.id === constantExpense.id,
                        );
                        const isBeingMarkedAsPaid =
                            markedAsPaidExpenseId === constantExpense.id;
                        const isPaid = !!filteredConstantExpense[PAID].find(
                            (expense) => expense.id === constantExpense.id,
                        );

                        const deleteContent = (
                            <>
                                <h5>
                                    Delete expense {`'${constantExpense.name}'`}
                                    ?
                                </h5>
                                <div className="flex-center gap-10">
                                    <ButtonIcon
                                        icon="fas fa-check fa-xs"
                                        handleClick={() =>
                                            handleDeleteExpense(constantExpense)
                                        }
                                    />
                                    <ButtonIcon
                                        icon="fa-solid fa-xmark fa-xs"
                                        handleClick={() =>
                                            undoDeleteExpense(constantExpense)
                                        }
                                    />
                                </div>
                            </>
                        );

                        const toBePaidContent = (
                            <>
                                <h5>
                                    Register expense as paid{' '}
                                    {`'${constantExpense.name}'`}?
                                </h5>
                                <div className="flex-center gap-10">
                                    <ButtonIcon
                                        icon="fas fa-check fa-xs"
                                        handleClick={() =>
                                            handleRegisterAsPaid(
                                                constantExpense,
                                            )
                                        }
                                    />
                                    <ButtonIcon
                                        icon="fa-solid fa-xmark fa-xs"
                                        handleClick={handleUndoMarkAsPaid}
                                    />
                                </div>
                            </>
                        );

                        const isQuestionShown =
                            isToBeDeleted || isBeingMarkedAsPaid;

                        return (
                            <li
                                className="flex-center gap-10 margin-bottom-sm full-width constant-expense_container"
                                key={constantExpense.id}
                            >
                                <div className="flex-center-column">
                                    <ButtonIcon
                                        isDisabled={isPaid}
                                        icon="fa-solid fa-circle-dollar-to-slot"
                                        style="button-icon__no-border button-icon__small"
                                        handleClick={() =>
                                            handleMarkAsPaid(constantExpense.id)
                                        }
                                    />
                                </div>
                                <ConstantExpense
                                    isDisabled={isDisabled}
                                    constantExpense={constantExpense}
                                    setConstantExpense={modifyChosenExpenseData}
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
                                                undoEditExpense(constantExpense)
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
                                        isQuestionShown &&
                                        'is-confirmation-text-shown'
                                    }`}
                                >
                                    {isBeingMarkedAsPaid && toBePaidContent}
                                    {isToBeDeleted && deleteContent}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <NoDataScreen
                    text="No constants expenses found... Wanna create a few?"
                    style="no-constant-expenses"
                />
            )}
        </>
    );
};

ConstantExpensesList.propTypes = {
    constantExpenses: PropTypes.arrayOf(ConstantExpenseType),
    currentlyFilteredExpenses: FilteredConstantExpenses,
    filteredConstantExpense: FilteredConstantExpenses,
    editConstantExpense: PropTypes.func.isRequired,
    deleteConstantExpense: PropTypes.func.isRequired,
    doRegisterExpenseAsPaid: PropTypes.func.isRequired,
};

export default ConstantExpensesList;
