import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import noTransactions from '../../../img/no-transactions.svg';
import { convertToString } from '../../../utils';
import Loader from '../../common/Loader/Loader';

const Transactions = ({ isLoading, transactions }) => {
    const transactionsList = useMemo(
        () =>
            transactions.map((transaction, index) => {
                const { value, category, transDate } = transaction;

                return (
                    <li
                        className="transactions__transaction transaction padding-vertical-sm"
                        key={`transaction_${index}`}
                    >
                        <p className="transaction__header text-sm">
                            <span>{category}</span>
                            <span>{`${convertToString(value)} HUF`}</span>
                        </p>
                        <p className="transaction__date text-xs text-bold">
                            {new Date(transDate).toLocaleString()}
                        </p>
                    </li>
                );
            }),
        [transactions],
    );

    return (
        <section className="transactions padding-vertical-sm">
            <Loader isLoading={isLoading}>
                {transactionsList?.length ? (
                    <div className="container">
                        <ul>{transactionsList}</ul>
                    </div>
                ) : (
                    <div className="transactions__no-transactions container">
                        <img
                            className="transactions__no-transactions-image"
                            src={noTransactions}
                            alt="No transactions"
                        />
                        <p className="transactions__no-transactions-text">
                            No transactions to show... Why not to file one?
                        </p>
                    </div>
                )}
            </Loader>
        </section>
    );
};

const transaction = {
    category: PropTypes.string.isRequired,
    transDate: PropTypes.number.isRequired,
    transType: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
};

Transactions.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.shape(transaction)).isRequired,
};

export default Transactions;
