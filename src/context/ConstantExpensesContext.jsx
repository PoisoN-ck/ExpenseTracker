import { createContext, useContext, useEffect, useMemo } from 'react';

import { useAuthContext } from '@context/AuthContext';
import { useDataStatusContext } from '@context/DataStatusContext';
import { useTransactionsContext } from '@context/TransactionsContext';
import useConstantExpenses from '@hooks/useConstantExpenses';

const ConstantExpensesContext = createContext(null);

export const ConstantExpensesProvider = ({ children }) => {
    const { isVerified } = useAuthContext();
    const { setDataError, setSuccessMessage, resetMessages } =
        useDataStatusContext();
    const {
        transactions,
        addConstantExpenseIdToExistingTransaction,
        totalBalance,
    } = useTransactionsContext();

    const {
        filteredConstantExpense,
        plannedExpenseDayRefresh,
        totalConstantExpensesToBePaid,
        totalConstantExpensesAmount,
        fetchPlannedExpenseDayRefresh,
        fetchAndUpdateConstantExpenses,
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        doRegisterExpenseAsPaid,
        updatePlannedExpenseDayRefresh,
    } = useConstantExpenses({
        isVerified,
        transactions,
        addConstantExpenseIdToExistingTransaction,
        setDataError,
        setSuccessMessage,
        resetMessages,
    });

    const initialLoad = async () => {
        const dayRefresh = await fetchPlannedExpenseDayRefresh();
        await fetchAndUpdateConstantExpenses(dayRefresh);
    };

    useEffect(() => {
        initialLoad();
    }, []);

    const freeCashAvailable = useMemo(
        () => totalBalance - totalConstantExpensesToBePaid,
        [totalBalance, totalConstantExpensesToBePaid],
    );

    const value = useMemo(
        () => ({
            filteredConstantExpense,
            plannedExpenseDayRefresh,
            totalConstantExpensesToBePaid,
            totalConstantExpensesAmount,
            freeCashAvailable,
            addConstantExpense,
            editConstantExpense,
            deleteConstantExpense,
            doRegisterExpenseAsPaid,
            updatePlannedExpenseDayRefresh,
        }),
        [
            filteredConstantExpense,
            plannedExpenseDayRefresh,
            totalConstantExpensesToBePaid,
            totalConstantExpensesAmount,
            freeCashAvailable,
            addConstantExpense,
            editConstantExpense,
            deleteConstantExpense,
            doRegisterExpenseAsPaid,
            updatePlannedExpenseDayRefresh,
        ],
    );

    return (
        <ConstantExpensesContext.Provider value={value}>
            {children}
        </ConstantExpensesContext.Provider>
    );
};

export const useConstantExpensesContext = () =>
    useContext(ConstantExpensesContext);
