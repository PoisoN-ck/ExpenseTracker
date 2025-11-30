import { useMemo } from 'react';

import PropTypes from 'prop-types';
import { ConstantExpense, Transaction } from '@types';
import { convertAmountToString, getPlannedExpenseType } from '@utils';
import Loader from '@components/common/Loader';
import NoDataScreen from '@components/common/NoDataScreen';
import useUserSettings from '@/hooks/useUserSettings';
import {
    MULTIPLE_EXPENSE_TEXT,
    ONE_TIME_EXPENSE_TEXT,
    RECURRING_EXPENSE_TEXT,
} from '@/constants';

const oneTimeIcon = <i className={`fa-solid fa-money-bill-1 fa-2xl`} />;
const recurringIcon = <i className="fa-solid fa-money-bill-transfer fa-2xl" />;
const multipleIcon = <i className={`fa-solid fa-money-bills fa-2xl`} />;

const PLANNED_EXPENSE_TYPE_ICONS = {
    [ONE_TIME_EXPENSE_TEXT]: oneTimeIcon,
    [RECURRING_EXPENSE_TEXT]: recurringIcon,
    [MULTIPLE_EXPENSE_TEXT]: multipleIcon,
};

const Transactions = ({ isLoading, transactions, plannedExpenses }) => {
    const { usersSettings } = useUserSettings();

    const allPlannedExpenses = plannedExpenses.reduce((acc, expense) => {
        return {
            ...acc,
            [expense.id]: expense,
        };
    }, {});

    const transactionsList = useMemo(
        () =>
            transactions.map((transaction) => {
                const {
                    value,
                    category,
                    transDate,
                    userId,
                    id,
                    constantExpenseId,
                } = transaction;

                const plannedExpense = allPlannedExpenses[constantExpenseId];
                const plannedExpenseType =
                    getPlannedExpenseType(plannedExpense);

                const plannedExpenseContent = plannedExpense && (
                    <span className="flex flex-align-center gap-5">
                        {PLANNED_EXPENSE_TYPE_ICONS[plannedExpenseType]}
                        {plannedExpense?.name}
                    </span>
                );

                return (
                    <li
                        className="flex-column transaction gap-5"
                        key={id}
                        style={{
                            backgroundColor:
                                (userId && usersSettings[userId]?.color) ||
                                'none',
                        }}
                    >
                        <div className="transaction__header text-sm">
                            <span>{category}</span>
                            <span>{`${convertAmountToString(value)} HUF`}</span>
                        </div>
                        <div className="transaction__date text-xs text-bold">
                            <span>{new Date(transDate).toLocaleString()}</span>
                            {plannedExpenseContent}
                        </div>
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
    plannedExpenses: PropTypes.arrayOf(PropTypes.shape(ConstantExpense))
        .isRequired,
};

export default Transactions;
