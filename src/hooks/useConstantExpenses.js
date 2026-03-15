import { onValue, ref, runTransaction } from 'firebase/database';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isWithinInterval } from 'date-fns';

import db, { auth } from '@/services/db';
import {
    CONSTANT_EXPENSE_FILTERS,
    DEFAULT_REFRESH_DAY,
    NOT_PAID,
} from '@constants';
import {
    filterTransactions,
    getPlannedExpensesDatePeriod,
    fetchValueAsPromise,
    updateValueWithConnectionCheck,
} from '@utils';

const checkConnection = () =>
    new Promise((resolve) => {
        onValue(
            ref(db, '.info/connected'),
            (snapshot) => resolve(snapshot.val()),
            { onlyOnce: true },
        );
    });

const useConstantExpenses = ({
    isVerified,
    transactions,
    addConstantExpenseIdToExistingTransaction,
    setDataError,
    setSuccessMessage,
    resetMessages,
}) => {
    // NOT USED IN UI, data storage only
    const [constantExpenses, setConstantExpenses] = useState([]);
    const [filteredConstantExpense, setFilteredConstantExpenses] = useState({});
    const [currentMonthExpenses, setCurrentMonthExpenses] = useState([]);
    const [plannedExpenseDayRefresh, setPlannedExpenseDayRefresh] =
        useState(DEFAULT_REFRESH_DAY);

    const filterOutOneTimePassedExpenses = (expenses, dayRange) =>
        expenses.filter((expense) =>
            expense.isOneTime
                ? isWithinInterval(expense.createdAt, dayRange)
                : expense,
        );

    const fetchPlannedExpenseDayRefresh = async () =>
        await fetchValueAsPromise({
            refPath: 'plannedExpenseDayRefresh',
            defaultValue: DEFAULT_REFRESH_DAY,
            onFetched: setPlannedExpenseDayRefresh,
            handleError: setDataError,
        });

    const fetchAndUpdateConstantExpenses = async (expenseDayRefresh) =>
        await new Promise((res, rej) => {
            try {
                const constantExpensesRef = ref(
                    db,
                    `${auth.currentUser?.uid}/constantExpenses`,
                );

                onValue(
                    constantExpensesRef,
                    (snapshot) => {
                        const fetchedConstantExpenses =
                            snapshot.val()?.filter((expense) => expense) || [];

                        const plannedExpensesDayRange =
                            getPlannedExpensesDatePeriod(expenseDayRefresh);

                        const noOneTimePassedExpenses =
                            filterOutOneTimePassedExpenses(
                                fetchedConstantExpenses,
                                plannedExpensesDayRange,
                            );

                        setConstantExpenses(noOneTimePassedExpenses);
                        res(fetchedConstantExpenses);
                    },
                    (error) => {
                        setDataError(error);
                        rej(false);
                    },
                );
            } catch (error) {
                setDataError(error);
                rej(false);
            }
        });

    const updatePlannedExpenseDayRefresh = useCallback(
        async (day) => {
            if (!day) {
                setDataError({ code: 'add-missing-refresh-day' });
                return false;
            }

            return await updateValueWithConnectionCheck({
                path: 'plannedExpenseDayRefresh',
                value: day,
                isVerified,
                successCode: 'updated-planned-expense-day-refresh',
                resetMessages,
                setSuccessMessage,
                setError: setDataError,
                restoreOnFail: () =>
                    setPlannedExpenseDayRefresh(plannedExpenseDayRefresh),
            });
        },
        [
            isVerified,
            plannedExpenseDayRefresh,
            setDataError,
            setSuccessMessage,
            resetMessages,
        ],
    );

    // TODO: Refactor similar methods and move to utils
    const addConstantExpense = useCallback(
        async (constantExpense) => {
            if (
                !constantExpense.id ||
                !constantExpense.category ||
                !constantExpense.name ||
                !constantExpense.amount
            ) {
                setDataError({ code: 'add-missing-fields' });
                return false;
            }

            const constantExpenseWithDate = {
                ...constantExpense,
                createdAt: Date.now(),
            };

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network-users-settings' });
                    return false;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setConstantExpenses((prev) => [
                        constantExpenseWithDate,
                        ...prev,
                    ]);
                    return false;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/constantExpenses`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((e) => e)
                            : [];
                        return [constantExpenseWithDate, ...existing];
                    },
                );
                setSuccessMessage({ code: 'added-constant-expense' });
                return true;
            } catch (error) {
                setDataError(error);
                return false;
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

    const editConstantExpense = useCallback(
        async (modifiedExpense) => {
            if (
                !modifiedExpense.id ||
                !modifiedExpense.category ||
                !modifiedExpense.name ||
                !modifiedExpense.amount
            ) {
                setDataError({ code: 'edit-missing-field' });
                return false;
            }

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network-users-settings' });
                    return false;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setConstantExpenses((prev) =>
                        prev.map((expense) =>
                            expense.id === modifiedExpense.id
                                ? modifiedExpense
                                : expense,
                        ),
                    );
                    return false;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/constantExpenses`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((e) => e)
                            : [];
                        return existing.map((expense) =>
                            expense.id === modifiedExpense.id
                                ? modifiedExpense
                                : expense,
                        );
                    },
                );
                setSuccessMessage({ code: 'edited-constant-expense' });
                return true;
            } catch (error) {
                setDataError(error);
                return false;
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

    const deleteConstantExpense = useCallback(
        async (deletedExpense) => {
            if (!deletedExpense.id) {
                setDataError({ code: 'delete-expense-missing-id' });
                return false;
            }

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network-users-settings' });
                    return false;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setConstantExpenses((prev) =>
                        prev.filter(
                            (expense) => expense.id !== deletedExpense.id,
                        ),
                    );
                    return false;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/constantExpenses`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((e) => e)
                            : [];
                        return existing.filter(
                            (expense) => expense.id !== deletedExpense.id,
                        );
                    },
                );
                setSuccessMessage({ code: 'deleted-constant-expense' });
                return true;
            } catch (error) {
                setDataError(error);
                return false;
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

    const updateFilteredConstantExpenses = useCallback(() => {
        const [, notPaid, paid] = CONSTANT_EXPENSE_FILTERS;

        const constantExpensesTransactionsOnly = currentMonthExpenses.filter(
            (transaction) => transaction.constantExpenseId,
        );

        const paidConstantExpenses = constantExpenses.filter(
            (constantExpense) =>
                constantExpensesTransactionsOnly.find(
                    (transaction) =>
                        transaction.constantExpenseId === constantExpense.id,
                ),
        );

        const paidIds = new Set(paidConstantExpenses.map((e) => e.id));
        const notPaidConstantExpenses = constantExpenses.filter(
            (constantExpense) => !paidIds.has(constantExpense.id),
        );

        setFilteredConstantExpenses({
            [paid]: paidConstantExpenses,
            [notPaid]: notPaidConstantExpenses,
        });
    }, [constantExpenses, currentMonthExpenses]);

    const doRegisterExpenseAsPaid = useCallback(
        async (constantExpense) => {
            const rangeAmount = 3000;
            const getMinAmount = (amount) =>
                amount - rangeAmount <= 0 ? 0 : amount - rangeAmount;
            const getMaxAmount = (amount) => amount + rangeAmount;

            const { amount, id, category } = constantExpense;

            const filteredTransactionsByCategoryWithConstantExpense =
                currentMonthExpenses.filter(
                    (transaction) =>
                        transaction.category === category &&
                        !transaction.constantExpenseId,
                );

            if (filteredTransactionsByCategoryWithConstantExpense.length) {
                const exactMatchExpense =
                    filteredTransactionsByCategoryWithConstantExpense.find(
                        (transaction) => transaction.value * -1 === amount,
                    );

                if (exactMatchExpense) {
                    return await addConstantExpenseIdToExistingTransaction({
                        ...exactMatchExpense,
                        constantExpenseId: id,
                    });
                }

                // If exact match was not found, try to find a match within a range amount
                const potentialMatchExpense =
                    filteredTransactionsByCategoryWithConstantExpense.find(
                        (transaction) => {
                            const transValue = transaction.value * -1;
                            return (
                                getMinAmount(amount) <= transValue &&
                                transValue <= getMaxAmount(amount)
                            );
                        },
                    );

                if (potentialMatchExpense) {
                    return await addConstantExpenseIdToExistingTransaction({
                        ...potentialMatchExpense,
                        constantExpenseId: id,
                    });
                }

                // If potential match was not found - fallback option - take first transaction from this category
                const [transactionFromCategoryWithoutConstantExpenseId] =
                    filteredTransactionsByCategoryWithConstantExpense;
                return await addConstantExpenseIdToExistingTransaction({
                    ...transactionFromCategoryWithoutConstantExpenseId,
                    constantExpenseId: id,
                });
            }

            setDataError({ code: 'constant-expense-cannot-be-paid' });
            return false;
        },
        [
            currentMonthExpenses,
            addConstantExpenseIdToExistingTransaction,
            setDataError,
        ],
    );

    useEffect(() => {
        const customDateRangeBySelectedRefreshDay =
            getPlannedExpensesDatePeriod(plannedExpenseDayRefresh);

        const currentCustomMonthTransactions = filterTransactions(
            transactions,
            'date',
            JSON.stringify(customDateRangeBySelectedRefreshDay),
        ).filter((transaction) => transaction.transType === 'Expense');

        setCurrentMonthExpenses(currentCustomMonthTransactions);
    }, [transactions, plannedExpenseDayRefresh]);

    useEffect(() => {
        updateFilteredConstantExpenses();
    }, [updateFilteredConstantExpenses]);

    const totalConstantExpensesToBePaid = useMemo(
        () =>
            filteredConstantExpense[NOT_PAID]?.reduce(
                (acc, constantExpense) => acc + constantExpense.amount,
                0,
            ) || 0,
        [filteredConstantExpense],
    );

    const totalConstantExpensesAmount = useMemo(
        () =>
            constantExpenses?.reduce(
                (acc, constantExpense) => acc + constantExpense.amount,
                0,
            ) || 0,
        [constantExpenses],
    );

    return {
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
    };
};

export default useConstantExpenses;
