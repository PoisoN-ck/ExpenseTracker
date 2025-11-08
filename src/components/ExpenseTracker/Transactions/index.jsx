import { useMemo } from 'react';

import PropTypes from 'prop-types';
import { Transaction, UserSetting } from '../../../types';
import { convertAmountToString } from '../../../utils';
import Loader from '../../common/Loader';
import NoDataScreen from '../../common/NoDataScreen';

const Transactions = ({ isLoading, transactions, usersSettings }) => {
    const transactionsList = useMemo(
        () =>
            transactions.map((transaction) => {
                const { value, category, transDate, userId, id } = transaction;

                return (
                    <li
                        className="transactions__transaction transaction"
                        key={id}
                        style={{
                            backgroundColor:
                                (userId &&
                                    usersSettings.find(
                                        (userSetting) =>
                                            userSetting?.id === userId,
                                    )?.color) ||
                                'none',
                        }}
                    >
                        <p className="transaction__header text-sm">
                            <span>{category}</span>
                            <span>{`${convertAmountToString(value)} HUF`}</span>
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
                    <div className="container transactions-container">
                        <ul>{transactionsList}</ul>
                    </div>
                ) : (
                    <NoDataScreen
                        text="No transactions to show... Why not to file one?"
                        style="transactions__no-transactions"
                    />
                )}
            </Loader>
        </section>
    );
};

Transactions.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.shape(Transaction)).isRequired,
    usersSettings: PropTypes.arrayOf(UserSetting),
};

export default Transactions;
