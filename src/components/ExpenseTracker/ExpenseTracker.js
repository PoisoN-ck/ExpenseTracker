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
import TrackerHeader from './TrackerHeader';
import TrackerStatus from './TrackerStatus';
import Transactions from './Transactions';

const ExpenseTracker = ({ isVerified, logOut }) => {
    const [isShownAllTransactions, setIsShownAllTransactions] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS_STATE);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [messageText, setMessageText] = useState(null);

    const {
        dataError,
        isLoading,
        successMessage,
        transactions,
        addTransaction,
        resetMessages,
        sendVerificationEmail,
        setDataError,
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
            <TrackerHeader
                filters={filters}
                handleSignOut={handleSignOut}
                setFilters={setFilters}
                setIsFilterApplied={setIsFilterApplied}
                setFilteredTransactions={setFilteredTransactions}
                shownTransactions={shownTransactions}
                transactions={transactions}
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
                resetMessages={resetMessages}
                setError={setDataError}
            />
        </>
    );
};

ExpenseTracker.propTypes = {
    isVerified: PropTypes.bool.isRequired,
    logOut: PropTypes.func.isRequired,
};

export default ExpenseTracker;
