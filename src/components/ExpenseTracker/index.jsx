import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_FILTERS_STATE, DEFAULT_NUM_OF_TRANSACTIONS } from '@constants';
import { sortTransactionsByDate } from '@utils';
import {
    DataStatusProvider,
    TransactionsProvider,
    ConstantExpensesProvider,
    UserSettingsProvider,
    useTransactionsContext,
    useAuthContext,
} from '@context';

import ActionBar from './ActionBar';
import AllTransactionsToggler from './AllTransactionsToggler';
import SideMenu from './SideMenu';
import TrackerHeader from './TrackerHeader';
import TrackerStatus from './TrackerStatus';
import Transactions from './Transactions';

const ExpenseTrackerContent = () => {
    const [isShownAllTransactions, setIsShownAllTransactions] = useState(false);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS_STATE);
    const [isFilterApplied, setIsFilterApplied] = useState(false);
    const [isMenuShown, setIsMenuShown] = useState(false);

    const { transactions } = useTransactionsContext();
    const { logOut } = useAuthContext();

    useEffect(() => {
        if (transactions?.length) {
            resetFilters();
        }
    }, [transactions]);

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
            />

            <TrackerHeader
                filters={filters}
                setFilters={setFilters}
                setIsFilterApplied={setIsFilterApplied}
                setFilteredTransactions={setFilteredTransactions}
                shownTransactions={shownTransactions}
                setIsMenuShown={setIsMenuShown}
            />

            <AllTransactionsToggler
                isShownAllTransactions={isShownAllTransactions}
                shownTransactions={shownTransactions}
                toggleShowAllTransactions={toggleShowAllTransactions}
            />

            <Transactions
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
                isFilterApplied={isFilterApplied}
                resetFilters={resetFilters}
            />

            <ActionBar handleShowSideMenu={handleShowMenuFromModal} />
        </>
    );
};

const ExpenseTracker = () => (
    <DataStatusProvider>
        <TransactionsProvider>
            <ConstantExpensesProvider>
                <UserSettingsProvider>
                    <ExpenseTrackerContent />
                </UserSettingsProvider>
            </ConstantExpensesProvider>
        </TransactionsProvider>
    </DataStatusProvider>
);

export default ExpenseTracker;
