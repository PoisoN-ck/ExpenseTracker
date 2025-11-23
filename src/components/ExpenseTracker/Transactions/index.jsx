import { useMemo } from 'react';

import PropTypes from 'prop-types';
import { Transaction } from '@types';
import { convertAmountToString } from '@utils';
import Loader from '@components/common/Loader';
import NoDataScreen from '@components/common/NoDataScreen';
import useUserSettings from '@/hooks/useUserSettings';

const Transactions = ({ isLoading, transactions }) => {
    const { usersSettings } = useUserSettings();

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
                                (userId && usersSettings[userId]?.color) ||
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
};

export default Transactions;
