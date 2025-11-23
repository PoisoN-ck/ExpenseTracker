import { useEffect, useMemo, useState } from 'react';
import {
    DEFAULT_FILTERS_STATE,
    DEFAULT_NUM_OF_TRANSACTIONS,
    NOT_PAID,
} from '@constants';
import { sortTransactionsByDate, translateMessage } from '@utils';

import { useData, useAuth } from '@hooks';
import ActionBar from './ActionBar';
import AllTransactionsToggler from './AllTransactionsToggler';
import SideMenu from './SideMenu';
import TrackerHeader from './TrackerHeader';
import TrackerStatus from './TrackerStatus';
import Transactions from './Transactions';

const ExpenseTracker = () => {
    const [isShownAllTransactions, setIsShownAllTransactions] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS_STATE);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [messageText, setMessageText] = useState(null);
    const [isMenuShown, setIsMenuShown] = useState(false);

    const {
        dataError,
        isLoading,
        successMessage,
        transactions,
        constantExpenses,
        filteredConstantExpense,
        totalConstantExpensesToBePaid,
        freeCashAvailable,
        totalBalance,
        totalConstantExpensesAmount,
        addTransaction,
        resetMessages,
        sendVerificationEmail,
        setDataError,
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        doRegisterExpenseAsPaid,
        payConstantExpenses,
    } = useData();

    const { logOut } = useAuth();

    useEffect(() => {
        if (transactions?.length) {
            resetFilters();
        }
    }, [transactions]);

    useEffect(() => {
        const message = dataError || successMessage;
        const text = message
            ? translateMessage(dataError || successMessage)
            : null;

        setMessageText(text);
    }, [dataError, successMessage]);

    const shownTransactions = useMemo(() => {
        return isFilterApplied
            ? filteredTransactions.sort(sortTransactionsByDate)
            : transactions;
    }, [isFilterApplied, filteredTransactions, transactions]);

    const resetFilters = () => {
        setIsFilterApplied(false);
        setFilteredTransactions([]);
        setFilters(DEFAULT_FILTERS_STATE);
    };

    const toggleShowAllTransactions = () => {
        setIsShownAllTransactions(!isShownAllTransactions);
    };

    const handleSignOut = async () => await logOut();

    const handleShowMenuFromModal = () => setIsMenuShown(true);

    return (
        <>
            <SideMenu
                isShown={isMenuShown}
                setIsShown={setIsMenuShown}
                handleSignOut={handleSignOut}
                constantExpenses={constantExpenses}
                addConstantExpense={addConstantExpense}
                editConstantExpense={editConstantExpense}
                deleteConstantExpense={deleteConstantExpense}
                filteredConstantExpense={filteredConstantExpense}
                doRegisterExpenseAsPaid={doRegisterExpenseAsPaid}
            />

            <TrackerHeader
                filters={filters}
                setFilters={setFilters}
                setIsFilterApplied={setIsFilterApplied}
                setFilteredTransactions={setFilteredTransactions}
                shownTransactions={shownTransactions}
                transactions={transactions}
                setIsMenuShown={setIsMenuShown}
                totalConstantExpensesToBePaid={totalConstantExpensesToBePaid}
                freeCashAvailable={freeCashAvailable}
                totalBalance={totalBalance}
                isDiffBalancesShown={!!constantExpenses.length}
                totalConstantExpensesAmount={totalConstantExpensesAmount}
            />

            <AllTransactionsToggler
                isShownAllTransactions={isShownAllTransactions}
                shownTransactions={shownTransactions}
                toggleShowAllTransactions={toggleShowAllTransactions}
            />

            <Transactions
                isLoading={isLoading}
                transactions={
                    isShownAllTransactions
                        ? shownTransactions
                        : shownTransactions.slice(
                              0,
                              DEFAULT_NUM_OF_TRANSACTIONS,
                          )
                }
            />

            <TrackerStatus
                dataError={dataError}
                isFilterApplied={isFilterApplied}
                isLoading={isLoading}
                messageText={messageText}
                resetMessages={resetMessages}
                resetFilters={resetFilters}
                sendVerificationEmail={sendVerificationEmail}
            />

            <ActionBar
                addTransaction={addTransaction}
                isDisabled={isLoading}
                setError={setDataError}
                notPaidConstantExpenses={filteredConstantExpense[NOT_PAID]}
                payConstantExpenses={payConstantExpenses}
                handleShowSideMenu={handleShowMenuFromModal}
            />
        </>
    );
};

export default ExpenseTracker;
