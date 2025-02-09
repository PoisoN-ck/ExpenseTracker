import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { ConstantExpense, UserSetting } from '../../../types';
import AmountInput from '../AmountInput';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import Modal from '../Modal';
import NoDataScreen from '../NoDataScreen';

const ConstantExpensePayModal = ({
    payConstantExpenses,
    notPaidConstantExpenses,
    handleClose,
    chosenUser,
    handleShowSideMenu,
}) => {
    const [notPaidExpenses, setNotPaidExpenses] = useState([]);

    const handleSelect = (isSelected, expense) => {
        setNotPaidExpenses((selectedExpenses) => {
            if (isSelected) {
                const updatedExpenses = selectedExpenses.map(
                    (selectedExpense) =>
                        selectedExpense.id === expense.id
                            ? { ...selectedExpense, isSelected }
                            : selectedExpense,
                );

                return updatedExpenses;
            }

            const oldAmountValue = notPaidConstantExpenses.find(
                (notPaidExpense) => notPaidExpense.id === expense.id,
            ).amount;

            const updatedExpensesWithOldAmount = selectedExpenses.map(
                (selectedExpense) =>
                    selectedExpense.id === expense.id
                        ? {
                              ...selectedExpense,
                              isSelected,
                              amount: oldAmountValue,
                          }
                        : selectedExpense,
            );

            return updatedExpensesWithOldAmount;
        });
    };

    const handleAmountChange = (value, expenseId) => {
        setNotPaidExpenses((expenses) =>
            expenses.map((expense) =>
                expense.id === expenseId
                    ? { ...expense, amount: value }
                    : expense,
            ),
        );
    };

    const handlePayConstantExpenses = () => {
        const constantExpensesWithUser = selectedConstantExpenses.map(
            (expense) => ({ ...expense, userId: chosenUser.id }),
        );
        const isPaid = payConstantExpenses(constantExpensesWithUser);

        if (isPaid) {
            handleClose();
        }
    };

    const selectedConstantExpenses = useMemo(
        () => notPaidExpenses.filter((expense) => expense.isSelected),
        [notPaidExpenses],
    );

    const constantExpensesToBePaid = useMemo(
        () =>
            notPaidExpenses?.map((expense) => {
                const isSelected = expense.isSelected;

                return (
                    <li
                        className={`pay-constant-expense__item margin-bottom-md  ${
                            isSelected && 'shadow__highlighted'
                        }`}
                        key={expense.id}
                    >
                        <div className="flex-center flex-align-center gap-10 pay-constant-expense__container">
                            <ButtonIcon
                                icon={`fa-solid fa-square-check ${
                                    !isSelected && 'button-icon__not-selected'
                                }`}
                                style="no-border"
                                handleClick={() =>
                                    handleSelect(!isSelected, expense)
                                }
                            />
                            <div
                                className={`text-center full-width padding-vertical-sm ${
                                    !isSelected && 'text-muted'
                                }`}
                            >
                                <p className="text-sm text-bold margin-bottom-sm">
                                    {expense.name}
                                </p>
                                <p className="text-sm text-bold">
                                    Category: {expense.category}
                                </p>
                            </div>
                            <div className="flex-center-column text-center full-width pay-constant-expense__amount-container">
                                <AmountInput
                                    isDisabled={!isSelected}
                                    style="pay-constant-expense__amount"
                                    placeholder="Actual amount"
                                    value={expense.amount}
                                    handleChange={(value) =>
                                        handleAmountChange(value, expense.id)
                                    }
                                />
                            </div>
                        </div>
                    </li>
                );
            }),
        [notPaidExpenses],
    );

    const isConstantExpensesExist = constantExpensesToBePaid.length;

    useEffect(() => {
        const notPaidExpenses = notPaidConstantExpenses.map((expense) => ({
            ...expense,
            isSelected: false,
        }));

        setNotPaidExpenses(notPaidExpenses);
    }, [notPaidConstantExpenses]);

    return (
        <Modal
            contentClassName="pay-constant-expense__modal"
            closeModal={handleClose}
            title="Pay constant expenses"
        >
            {isConstantExpensesExist ? (
                <ul className="flex-column flex-align-center container__vertical-scroll small-height-container padding-md">
                    {constantExpensesToBePaid}
                </ul>
            ) : (
                <div className="flex-center-column" style={{ height: '350px' }}>
                    <NoDataScreen
                        text="No constants expenses found... Wanna create a few?"
                        style="no-constant-expenses"
                    />
                </div>
            )}
            <div className="text-center top-border__main-color padding-vertical-md">
                {isConstantExpensesExist ? (
                    <Button
                        isDisabled={!selectedConstantExpenses.length}
                        variant="blue"
                        isRounded
                        text="Pay selected expenses"
                        handleClick={handlePayConstantExpenses}
                    />
                ) : (
                    <Button
                        variant="blue"
                        isRounded
                        text="Add new constant expenses"
                        handleClick={() => {
                            handleClose();
                            handleShowSideMenu();
                        }}
                    />
                )}
            </div>
        </Modal>
    );
};

ConstantExpensePayModal.propTypes = {
    payConstantExpenses: PropTypes.func.isRequired,
    notPaidConstantExpenses: PropTypes.arrayOf(ConstantExpense),
    handleClose: PropTypes.func.isRequired,
    chosenUser: UserSetting,
    handleShowSideMenu: PropTypes.func.isRequired,
};

export default ConstantExpensePayModal;
