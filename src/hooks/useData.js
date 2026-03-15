import { onValue, ref, runTransaction } from 'firebase/database';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendEmailVerification } from 'firebase/auth';

import db, { auth } from '@/services/db';
import {
    CONSTANT_EXPENSE_FILTERS,
    DEFAULT_REFRESH_DAY,
    NOT_PAID,
} from '@constants';
import {
    filterTransactions,
    sortTransactionsByDate,
    getPlannedExpensesDatePeriod,
    fetchValueAsPromise,
    updateValueWithConnectionCheck,
} from '@utils';
import { useAuth } from '@hooks';
import { isWithinInterval } from 'date-fns';

const useData = () => {
    const { isVerified } = useAuth();

    // TODO: Potentially need separation of transactions and constantExpenses to different files
    const [transactions, setTransactions] = useState([]);
    // TOOD: Revise appoach with setIsLoading! It seems it is not needed in the methods at all! Only on initial fetch
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // NOT USED IN UI, data storage only
    const [constantExpenses, setConstantExpenses] = useState([]);
    // Filtered constant expenses for UI
    const [filteredConstantExpense, setFilteredConstantExpenses] = useState({});
    // Transactions made in the current month,
    // based on plannedExpenseDayRefresh
    const [currentMonthExpenses, setCurrentMonthExpenses] = useState([]);
    const [plannedExpenseDayRefresh, setPlannedExpenseDayRefresh] =
        useState(DEFAULT_REFRESH_DAY);

    const resetMessages = () => {
        setDataError(null);
        setSuccessMessage(null);
    };

    // .info/connected only works with onValue, not get()
    const checkConnection = () =>
        new Promise((resolve) => {
            onValue(
                ref(db, '.info/connected'),
                (snapshot) => resolve(snapshot.val()),
                { onlyOnce: true },
            );
        });

    const fetchPlannedExpenseDayRefresh = async () =>
        await fetchValueAsPromise({
            refPath: 'plannedExpenseDayRefresh',
            defaultValue: DEFAULT_REFRESH_DAY,
            onFetched: setPlannedExpenseDayRefresh,
            handleError: setDataError,
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
        [isVerified, plannedExpenseDayRefresh],
    );

    const filterOutOneTimePassedExpenses = (expenses, dayRange) =>
        expenses.filter((expense) =>
            expense.isOneTime
                ? isWithinInterval(expense.createdAt, dayRange)
                : expense,
        );

    // Fetches and updates the states if transactions are updated
    const fetchAndUpdateTransactions = async () =>
        await new Promise((res, rej) => {
            try {
                const transactionsRef = ref(
                    db,
                    `${auth.currentUser?.uid}/transactionsList`,
                );

                onValue(
                    transactionsRef,
                    (snapshot) => {
                        const fetchedTransactions =
                            snapshot
                                .val()
                                // Fallback if some transactions are manually deleted
                                ?.filter((transaction) => transaction)
                                .sort(sortTransactionsByDate) || [];

                        setTransactions(fetchedTransactions);
                        res(fetchedTransactions);
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
                        setIsLoading(false);
                        rej(false);
                    },
                );
            } catch (error) {
                setDataError(error);
                setIsLoading(false);
                rej(false);
            }
        });

    const addTransaction = useCallback(
        async (transaction) => {
            if (!transaction.value) return;

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network' });
                    return;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setTransactions([transaction, ...transactions]);
                    return;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/transactionsList`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((t) => t)
                            : [];
                        return [transaction, ...existing];
                    },
                );
                setSuccessMessage({ code: 'added-transaction' });
            } catch (error) {
                setDataError(error);
            } finally {
                setIsLoading(false);
            }
        },
        [transactions, isVerified],
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
                    setConstantExpenses([
                        constantExpenseWithDate,
                        ...constantExpenses,
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
            } finally {
                setIsLoading(false);
            }
        },
        [constantExpenses, isVerified],
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
                    setConstantExpenses(
                        constantExpenses.map((expense) =>
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
            } finally {
                setIsLoading(false);
            }
        },
        [constantExpenses, isVerified],
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
                    setConstantExpenses(
                        constantExpenses.filter(
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
            } finally {
                setIsLoading(false);
            }
        },
        [constantExpenses, isVerified],
    );

    // To be moved out
    const sendVerificationEmail = async () => {
        const user = auth.currentUser;

        resetMessages();

        if (user) {
            try {
                setIsLoading(true);
                await sendEmailVerification(user);
                setSuccessMessage({ code: 'email-sent' });
            } catch (error) {
                setDataError(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

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

    const addConstantExpenseIdToExistingTransaction = useCallback(
        async (transactionWithConstantId) => {
            if (
                !transactionWithConstantId.value ||
                !transactionWithConstantId.constantExpenseId
            )
                return;

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network' });
                    return false;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setTransactions(
                        transactions.map((t) =>
                            t.id === transactionWithConstantId.id
                                ? transactionWithConstantId
                                : t,
                        ),
                    );
                    return false;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/transactionsList`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((t) => t)
                            : [];
                        return existing.map((t) =>
                            t.id === transactionWithConstantId.id
                                ? transactionWithConstantId
                                : t,
                        );
                    },
                );
                setSuccessMessage({ code: 'constant-expense-marked-as-paid' });
                return true;
            } catch (error) {
                setDataError(error);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [transactions, isVerified],
    );

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
                    const isPaid =
                        await addConstantExpenseIdToExistingTransaction({
                            ...exactMatchExpense,
                            constantExpenseId: id,
                        });

                    return isPaid;
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
                    const isPaid =
                        await addConstantExpenseIdToExistingTransaction({
                            ...potentialMatchExpense,
                            constantExpenseId: id,
                        });

                    return isPaid;
                }

                // If pontential match was not found - fallback option - take first transaction from this category
                const [transactionFromCategoryWithoutConstantExpenseId] =
                    filteredTransactionsByCategoryWithConstantExpense;
                const isPaid = await addConstantExpenseIdToExistingTransaction({
                    ...transactionFromCategoryWithoutConstantExpenseId,
                    constantExpenseId: id,
                });

                return isPaid;
            }

            setDataError({ code: 'constant-expense-cannot-be-paid' });

            return false;
        },
        [currentMonthExpenses, addConstantExpenseIdToExistingTransaction],
    );

    const payConstantExpenses = useCallback(
        async (constantExpenses) => {
            if (!constantExpenses.length) return;

            // TODO: Make a common addTransaction method to handle this case as well
            const newTransactions = constantExpenses.map((expense) => ({
                category: expense.category,
                id: uuidv4(),
                transDate: Date.now(),
                transType: 'Expense',
                value: expense.amount * -1,
                constantExpenseId: expense.id,
                userId: expense.userId,
            }));

            try {
                const isConnected = await checkConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network' });
                    return false;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setTransactions([...transactions, ...newTransactions]);
                    return false;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/transactionsList`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((t) => t)
                            : [];
                        return [...existing, ...newTransactions];
                    },
                );
                setSuccessMessage({ code: 'constant-expenses-paid' });
                return true;
            } catch (error) {
                setDataError(error);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [transactions, isVerified],
    );

    const totalBalance = useMemo(
        () =>
            transactions?.reduce(
                (acc, transaction) => acc + transaction.value,
                0,
            ) || 0,
        [transactions],
    );

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

    const freeCashAvailable = useMemo(
        () => totalBalance - totalConstantExpensesToBePaid,
        [totalConstantExpensesToBePaid, totalBalance],
    );

    const initialLoad = useCallback(async () => {
        setIsLoading(true);
        const expenseDayRefresh = await fetchPlannedExpenseDayRefresh();
        await fetchAndUpdateConstantExpenses(expenseDayRefresh);
        await fetchAndUpdateTransactions();
        setIsLoading(false);
    }, [
        fetchAndUpdateConstantExpenses,
        fetchAndUpdateTransactions,
        fetchPlannedExpenseDayRefresh,
    ]);

    useEffect(() => {
        initialLoad();
    }, []);

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

    return {
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
        plannedExpenseDayRefresh,
        addTransaction,
        resetMessages,
        sendVerificationEmail,
        setDataError,
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        doRegisterExpenseAsPaid,
        payConstantExpenses,
        updatePlannedExpenseDayRefresh,
    };
};

export default useData;
