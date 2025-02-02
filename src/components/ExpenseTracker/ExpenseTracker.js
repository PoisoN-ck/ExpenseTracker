import React, { useEffect, useMemo, useState } from 'react';
import {
    DEFAULT_FILTERS_STATE,
    DEFAULT_NUM_OF_TRANSACTIONS,
} from '../../constants';
import { sortTransactionsByDate, translateMessage } from '../../utils';

import PropTypes from 'prop-types';
import useData from '../../hooks/useData';
import ActionBar from './ActionBar';
import AllTransactionsToggler from './AllTransactionsToggler';
import SideMenu from './SideMenu';
import TrackerHeader from './TrackerHeader';
import TrackerStatus from './TrackerStatus';
import Transactions from './Transactions';

const DEFAULT_USER_STATE = { name: '', color: '', id: '' };

const ExpenseTracker = ({ isVerified, logOut }) => {
    const [isShownAllTransactions, setIsShownAllTransactions] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS_STATE);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [messageText, setMessageText] = useState(null);
    const [isMenuShown, setIsMenuShown] = useState(false);
    const [chosenUser, setChosenUser] = useState(DEFAULT_USER_STATE);

    const {
        dataError,
        isLoading,
        successMessage,
        transactions,
        usersSettings,
        constantExpenses,
        filteredConstantExpense,
        addTransaction,
        resetMessages,
        sendVerificationEmail,
        setDataError,
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        addUserSettings,
    } = useData(isVerified);

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

    useEffect(() => {
        const previouslySelectedUser = localStorage.getItem('userSettings');

        if (previouslySelectedUser) {
            const selectedUser = JSON.parse(previouslySelectedUser);

            setChosenUser(selectedUser);

            return;
        }
    }, []);

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

    return (
        <>
            <SideMenu
                isShown={isMenuShown}
                setIsShown={setIsMenuShown}
                addUserSettings={addUserSettings}
                usersSettings={usersSettings}
                chosenUser={chosenUser}
                setChosenUser={setChosenUser}
                handleSignOut={handleSignOut}
                constantExpenses={constantExpenses}
                addConstantExpense={addConstantExpense}
                editConstantExpense={editConstantExpense}
                deleteConstantExpense={deleteConstantExpense}
                filteredConstantExpense={filteredConstantExpense}
            />

            <TrackerHeader
                filters={filters}
                setFilters={setFilters}
                setIsFilterApplied={setIsFilterApplied}
                setFilteredTransactions={setFilteredTransactions}
                shownTransactions={shownTransactions}
                transactions={transactions}
                setIsMenuShown={setIsMenuShown}
            />

            <AllTransactionsToggler
                isShownAllTransactions={isShownAllTransactions}
                shownTransactions={shownTransactions}
                toggleShowAllTransactions={toggleShowAllTransactions}
            />

            <Transactions
                usersSettings={usersSettings}
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
                isVerified={isVerified}
                messageText={messageText}
                resetMessages={resetMessages}
                resetFilters={resetFilters}
                sendVerificationEmail={sendVerificationEmail}
            />

            <ActionBar
                addTransaction={addTransaction}
                className="action-bar"
                isDisabled={isLoading}
                setError={setDataError}
                chosenUser={chosenUser}
            />
        </>
    );
};

ExpenseTracker.propTypes = {
    isVerified: PropTypes.bool.isRequired,
    logOut: PropTypes.func.isRequired,
};

export default ExpenseTracker;
