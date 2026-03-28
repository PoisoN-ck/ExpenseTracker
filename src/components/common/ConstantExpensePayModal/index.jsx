import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { ConstantExpense, UserSetting } from '@types';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import NoDataScreen from '@components/common/NoDataScreen';
import ConstantExpenseItem from './ConstantExpenseItem';

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
                const expensesWithSelection = selectedExpenses.map(
                    (selectedExpense) =>
                        selectedExpense.id === expense.id
                            ? { ...selectedExpense, isSelected }
                            : selectedExpense,
                );

                return expensesWithSelection;
            }

            const sourceExpense = notPaidConstantExpenses.find(
                (notPaidExpense) => notPaidExpense.id === expense.id,
            );
            const unpaidAmount = sourceExpense.isMultiple
                ? sourceExpense.amount - (sourceExpense.paidAmount || 0)
                : sourceExpense.amount;

            const deselectedExpenses = selectedExpenses.map(
                (selectedExpense) =>
                    selectedExpense.id === expense.id
                        ? {
                              ...selectedExpense,
                              isSelected,
                              amount: unpaidAmount,
                          }
                        : selectedExpense,
            );

            return deselectedExpenses;
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

    const handlePayConstantExpenses = async () => {
        const constantExpensesWithUser = selectedConstantExpenses.map(
            (expense) => ({ ...expense, userId: chosenUser.id }),
        );
        const isPaid = await payConstantExpenses(constantExpensesWithUser);

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
            notPaidExpenses?.map((expense) => (
                <ConstantExpenseItem
                    key={expense.id}
                    expense={expense}
                    notPaidConstantExpenses={notPaidConstantExpenses}
                    handleSelect={handleSelect}
                    handleAmountChange={handleAmountChange}
                />
            )),
        [notPaidExpenses, notPaidConstantExpenses],
    );

    const isConstantExpensesExist = constantExpensesToBePaid.length > 0;

    useEffect(() => {
        const notPaidExpenses = notPaidConstantExpenses.map((expense) => ({
            ...expense,
            isSelected: false,
            amount: expense.isMultiple
                ? expense.amount - (expense.paidAmount || 0)
                : expense.amount,
        }));

        setNotPaidExpenses(notPaidExpenses);
    }, [notPaidConstantExpenses]);

    return (
        <Modal
            contentClassName="pay-constant-expense__modal"
            closeModal={handleClose}
            title="Pay planned expenses"
        >
            {isConstantExpensesExist ? (
                <ul className="pay-constant-expense__list-container flex-column container__vertical-scroll">
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
                        text="Add new planned expenses"
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
