import { createContext, useContext, useMemo } from 'react';

import { useAuthContext } from '@context/AuthContext';
import { useDataStatusContext } from '@context/DataStatusContext';
import useTransactions from '@hooks/useTransactions';

const TransactionsContext = createContext(null);

export const TransactionsProvider = ({ children }) => {
    const { isVerified } = useAuthContext();
    const { setIsLoading, setDataError, setSuccessMessage, resetMessages } =
        useDataStatusContext();

    const {
        transactions,
        addTransaction,
        addConstantExpenseIdToExistingTransaction,
        payConstantExpenses,
        totalBalance,
    } = useTransactions({
        isVerified,
        setIsLoading,
        setDataError,
        setSuccessMessage,
        resetMessages,
    });

    const value = useMemo(
        () => ({
            transactions,
            addTransaction,
            addConstantExpenseIdToExistingTransaction,
            payConstantExpenses,
            totalBalance,
        }),
        [
            transactions,
            addTransaction,
            addConstantExpenseIdToExistingTransaction,
            payConstantExpenses,
            totalBalance,
        ],
    );

    return (
        <TransactionsContext.Provider value={value}>
            {children}
        </TransactionsContext.Provider>
    );
};

export const useTransactionsContext = () => useContext(TransactionsContext);
