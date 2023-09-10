import React, { useCallback, useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { categories } from '../../../constants/constants';
import Modal from '../../common/Modal';

const ActionBar = ({ addTransaction, setError }) => {
    const [transactionAmount, setTransactionAmount] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        if (!transactionAmount) {
            setError({ code: 'empty-value' });
            return;
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleAmountChange = (event) => {
        const { value } = event.target;
        const convertedValue = Number(value);

        if (Number.isNaN(convertedValue)) return;

        if (convertedValue < 1) {
            setTransactionAmount('');
            return;
        }

        setTransactionAmount(convertedValue);
    };

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
            };

            addTransaction(transaction);
            setTransactionAmount('');
            handleCloseModal();
        },
        [transactionAmount],
    );

    const transactionCategories = useMemo(() => {
        return categories.map((category, index) => {
            return (
                <button
                    key={`cat_button_${index}`}
                    className="flex-list__item flex-list__item--lg button button--white button--round"
                    type="button"
                    data-category={category}
                    onClick={handleAddTransaction}
                >
                    {category}
                </button>
            );
        });
    }, [handleAddTransaction]);

    return (
        <section className="action-bar padding-vertical-md">
            <div className="flex-center container">
                <input
                    className="action-bar__input-field"
                    onChange={handleAmountChange}
                    value={transactionAmount}
                    placeholder="Enter the amount..."
                />
                <button
                    className="action-bar__button button button--round button--blue"
                    type="button"
                    data-modal="addTransactionModal"
                    onClick={handleOpenModal}
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
            </div>
        </section>
    );
};

ActionBar.propTypes = {
    addTransaction: PropTypes.func.isRequired,
    resetMessages: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
};

export default ActionBar;
