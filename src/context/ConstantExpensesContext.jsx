import { createContext, useContext, useMemo } from 'react';

import { useAuthContext } from '@context/AuthContext';
import { useDataStatusContext } from '@context/DataStatusContext';
import useConstantExpenses from '@hooks/useConstantExpenses';

const ConstantExpensesContext = createContext(null);

export const ConstantExpensesProvider = ({ children }) => {
    const { isVerified } = useAuthContext();
    const { setDataError, setSuccessMessage, resetMessages } =
        useDataStatusContext();

    const {
        filteredConstantExpense,
        plannedExpenseDayRefresh,
        totalConstantExpensesToBePaid,
        totalConstantExpensesAmount,
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        markExpensesAsPaid,
        updatePlannedExpenseDayRefresh,
    } = useConstantExpenses({
        isVerified,
        setDataError,
        setSuccessMessage,
        resetMessages,
    });

    const value = useMemo(
        () => ({
            filteredConstantExpense,
            plannedExpenseDayRefresh,
            totalConstantExpensesToBePaid,
            totalConstantExpensesAmount,
            addConstantExpense,
            editConstantExpense,
            deleteConstantExpense,
            markExpensesAsPaid,
            updatePlannedExpenseDayRefresh,
        }),
        [
            filteredConstantExpense,
            plannedExpenseDayRefresh,
            totalConstantExpensesToBePaid,
            totalConstantExpensesAmount,
            addConstantExpense,
            editConstantExpense,
            deleteConstantExpense,
            markExpensesAsPaid,
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
