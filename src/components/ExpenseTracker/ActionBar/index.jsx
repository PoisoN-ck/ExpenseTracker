import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLongPress } from '@uidotdev/usehooks';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { categories, NOT_PAID } from '@constants';
import AmountInput from '@components/common/AmountInput';
import Button from '@components/common/Button';
import ConstantExpensePayModal from '@components/common/ConstantExpensePayModal';
import Modal from '@components/common/Modal';
import {
    useTransactionsContext,
    useConstantExpensesContext,
    useDataStatusContext,
} from '@context';

const ActionBar = ({ handleShowSideMenu }) => {
    const { addTransaction, payConstantExpenses } = useTransactionsContext();
    const { filteredConstantExpense, markExpensesAsPaid, addPartialPayment } =
        useConstantExpensesContext();
    const { isLoading, setDataError } = useDataStatusContext();
    const notPaidConstantExpenses = filteredConstantExpense[NOT_PAID];
    const [chosenUser, setChosenUser] = useState(null);
    const [transactionAmount, setTransactionAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConstantExpenseModalOpen, setIsConstantExpenseModalOpen] =
        useState(false);
    const [isAddButtonAnimated, setIsAddButtonAnimated] = useState(false);
    const alreadySelectedUser = localStorage.getItem('userSettings');

    const handleOpenModal = () => {
        if (!transactionAmount) {
            setDataError({ code: 'empty-value' });
            return;
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleAmountChange = (value) => setTransactionAmount(value);

    const handleAddTransaction = useCallback(
        (event) => {
            const { category } = event.target.dataset;
            const isProfit = category === 'Profit';

            const transaction = {
                value: isProfit ? transactionAmount : -transactionAmount,
                category,
                transType: isProfit ? 'Income' : 'Expense',
                transDate: new Date().getTime(),
                id: uuidv4(),
                ...(chosenUser?.id ? { userId: chosenUser?.id } : {}),
            };

            addTransaction(transaction);
            setTransactionAmount('');
            handleCloseModal();
        },
        [transactionAmount],
    );

    const transactionCategories = useMemo(
        () =>
            categories.map((category, index) => (
                <button
                    key={`cat_button_${index}`}
                    className="flex-list__item flex-list__item--lg button button--white button--round"
                    type="button"
                    data-category={category}
                    onClick={handleAddTransaction}
                >
                    {category}
                </button>
            )),
        [handleAddTransaction],
    );

    const longPressButtonAttributes = useLongPress(
        () => {
            setIsConstantExpenseModalOpen(true);
        },
        {
            onStart: () => setIsAddButtonAnimated(true),
            onFinish: () => setIsAddButtonAnimated(false),
            onCancel: () => setIsAddButtonAnimated(false),
            threshold: 1000,
        },
    );

    const handleConstantExpenseClose = () =>
        setIsConstantExpenseModalOpen(false);

    const handleConstantExpensePayment = async (expenses) => {
        const isPaid = await payConstantExpenses(expenses);

        if (!isPaid) return;

        const regularExpenses = expenses.filter((e) => !e.isMultiple);
        const multipleExpenses = expenses.filter((e) => e.isMultiple);

        if (regularExpenses.length) markExpensesAsPaid(regularExpenses);
        if (multipleExpenses.length) addPartialPayment(multipleExpenses);

        return true;
    };

    useEffect(() => {
        if (alreadySelectedUser) {
            const selectedUser = JSON.parse(alreadySelectedUser);

            setChosenUser(selectedUser);

            return;
        }
    }, [alreadySelectedUser]);

    return (
        <section className="action-bar padding-vertical-md">
            <div className="flex-center container gap-10">
                <AmountInput
                    handleChange={handleAmountChange}
                    value={transactionAmount}
                    placeholder="Enter the amount..."
                />
                <Button
                    text="Add"
                    isDisabled={isLoading}
                    style={`action-bar__button ${
                        isAddButtonAnimated && 'animated-button'
                    }`}
                    isRounded
                    data-modal="addTransactionModal"
                    handleClick={handleOpenModal}
                    {...longPressButtonAttributes}
                />
                {isModalOpen && (
                    <Modal
                        closeModal={handleCloseModal}
                        title="Choose category"
                    >
                        <div className="flex-list">{transactionCategories}</div>
                    </Modal>
                )}
                {isConstantExpenseModalOpen && (
                    <ConstantExpensePayModal
                        notPaidConstantExpenses={notPaidConstantExpenses}
                        handleClose={handleConstantExpenseClose}
                        payConstantExpenses={handleConstantExpensePayment}
                        chosenUser={chosenUser}
                        handleShowSideMenu={handleShowSideMenu}
                    />
                )}
            </div>
        </section>
    );
};

ActionBar.propTypes = {
    handleShowSideMenu: PropTypes.func.isRequired,
};

export default ActionBar;
