import React, { useCallback, useMemo, useState } from 'react';

import { useLongPress } from '@uidotdev/usehooks';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { categories } from '../../../constants';
import {
    ConstantExpense as ConstantExpenseType,
    UserSetting,
} from '../../../types';
import AmountInput from '../../common/AmountInput';
import ConstantExpensePayModal from '../../common/ConstantExpensePayModal/ConstantExpensePayModal';
import Modal from '../../common/Modal';

const ActionBar = ({
    addTransaction,
    setError,
    isDisabled,
    chosenUser,
    notPaidConstantExpenses,
    payConstantExpenses,
}) => {
    const [transactionAmount, setTransactionAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConstantExpenseModalOpen, setIsConstantExpenseModalOpen] =
        useState(false);
    const [isAddButtonAnimated, setIsAddButtonAnimated] = useState(false);

    const handleOpenModal = () => {
        if (!transactionAmount) {
            setError({ code: 'empty-value' });
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
                value: isProfit ? transactionAmount : transactionAmount * -1,
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

    return (
        <section className="action-bar padding-vertical-md">
            <div className="flex-center container">
                <AmountInput
                    handleChange={handleAmountChange}
                    value={transactionAmount}
                    placeholder="Enter the amount..."
                />
                <button
                    disabled={isDisabled}
                    className={`action-bar__button button button--round button--blue ${
                        isAddButtonAnimated && 'animated-button'
                    }`}
                    type="button"
                    data-modal="addTransactionModal"
                    onClick={handleOpenModal}
                    {...longPressButtonAttributes}
                >
                    Add
                </button>
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
                        payConstantExpenses={payConstantExpenses}
                        chosenUser={chosenUser}
                    />
                )}
            </div>
        </section>
    );
};

ActionBar.propTypes = {
    addTransaction: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
    isDisabled: PropTypes.bool,
    chosenUser: UserSetting,
    notPaidConstantExpenses: PropTypes.arrayOf(ConstantExpenseType),
    payConstantExpenses: PropTypes.func.isRequired,
};

export default ActionBar;
