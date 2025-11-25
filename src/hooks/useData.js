import { child, get, onValue, ref, set } from 'firebase/database';
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

    const fetchPlannedExpenseDayRefresh = () =>
        fetchValueAsPromise({
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

    // One-time fetch, usually not needed
    const fetchTransactions = useCallback(() => {
        get(child(ref(db), `${auth.currentUser?.uid}/transactionsList`))
            .then((snapshot) => {
                const fetchedTransactions = snapshot
                    .val()
                    // Fallback if transactions are manually deleted
                    ?.filter((transaction) => transaction)
                    .sort(sortTransactionsByDate);

                if (fetchedTransactions?.length) {
                    setTransactions(fetchedTransactions);
                }
            })
            .catch((error) => {
                setDataError(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

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

    const fetchAndUpdateConstantExpenses = async () =>
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

                        setConstantExpenses(fetchedConstantExpenses);
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

            const connectionRef = ref(db, '.info/connected');

            let isFailedAttempt = false;

            try {
                onValue(connectionRef, (snapshot) => {
                    const isNetworkExist = snapshot.val();

                    if (!isNetworkExist) {
                        isFailedAttempt = true;
                        setDataError({ code: 'no-network' });
                        return;
                    }

                    resetMessages();

                    // Making sure that transactions
                    // are not registred in offline mode
                    if (isFailedAttempt) return;

                    try {
                        if (isVerified) {
                            setIsLoading(true);
                            set(
                                ref(
                                    db,
                                    `${auth.currentUser?.uid}/transactionsList`,
                                ),
                                [transaction, ...transactions],
                            )
                                .then(() => {
                                    setSuccessMessage({
                                        code: 'added-transaction',
                                    });
                                })
                                .catch((error) => {
                                    setDataError(error);
                                })
                                .finally(() => {
                                    setIsLoading(false);
                                });
                        } else {
                            setDataError({ code: 'no-data-saved' });
                            setTransactions([transaction, ...transactions]);
                        }
                    } catch (error) {
                        setDataError(error);
                    } finally {
                        setIsLoading(false);
                    }
                });
            } catch (error) {
                setDataError(error);
            }
        },
        [successMessage, transactions, isVerified],
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
                createdAt: new Date().getTime(),
            };

            const connectionRef = ref(db, '.info/connected');
            const addConstantExpensePromise = async () =>
                await new Promise((res, rej) => {
                    let isFailedAttempt = false;

                    try {
                        onValue(connectionRef, (snapshot) => {
                            const isNetworkExist = snapshot.val();

                            if (!isNetworkExist) {
                                isFailedAttempt = true;
                                setDataError({
                                    code: 'no-network-users-settings',
                                });
                                rej(false);
                                return;
                            }

                            resetMessages();

                            // Making sure that settings
                            // are not saved in offline mode
                            if (isFailedAttempt) {
                                rej(false);
                                return;
                            }

                            try {
                                if (isVerified) {
                                    setIsLoading(true);
                                    set(
                                        ref(
                                            db,
                                            `${auth.currentUser?.uid}/constantExpenses`,
                                        ),
                                        [
                                            constantExpenseWithDate,
                                            ...constantExpenses,
                                        ],
                                    )
                                        .then(() => {
                                            setSuccessMessage({
                                                code: 'added-constant-expense',
                                            });
                                            res(true);
                                        })
                                        .catch((error) => {
                                            setDataError(error);
                                            rej(false);
                                        })
                                        .finally(() => {
                                            setIsLoading(false);
                                        });
                                } else {
                                    setDataError({ code: 'no-data-saved' });
                                    setConstantExpenses([
                                        constantExpenseWithDate,
                                        ...constantExpenses,
                                    ]);
                                    rej(false);
                                }
                            } catch (error) {
                                setDataError(error);
                                rej(false);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                    } catch (error) {
                        setDataError(error);
                        rej(false);
                    }
                });

            const result = await addConstantExpensePromise();

            return result;
        },
        [successMessage, constantExpenses, isVerified],
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

            const connectionRef = ref(db, '.info/connected');
            const editConstantExpensePromise = async () =>
                await new Promise((res, rej) => {
                    let isFailedAttempt = false;

                    try {
                        onValue(connectionRef, (snapshot) => {
                            const isNetworkExist = snapshot.val();

                            if (!isNetworkExist) {
                                isFailedAttempt = true;
                                setDataError({
                                    code: 'no-network-users-settings',
                                });
                                rej(false);
                                return;
                            }

                            resetMessages();

                            // Making sure that settings
                            // are not saved in offline mode
                            if (isFailedAttempt) {
                                rej(false);
                                return;
                            }

                            // Paste into the array of data the expense replaced with new data
                            const modifiedExpenses = constantExpenses.map(
                                (expense) =>
                                    expense.id === modifiedExpense.id
                                        ? modifiedExpense
                                        : expense,
                            );

                            try {
                                if (isVerified) {
                                    setIsLoading(true);
                                    set(
                                        ref(
                                            db,
                                            `${auth.currentUser?.uid}/constantExpenses`,
                                        ),
                                        modifiedExpenses,
                                    )
                                        .then(() => {
                                            setSuccessMessage({
                                                code: 'edited-constant-expense',
                                            });
                                            res(true);
                                        })
                                        .catch((error) => {
                                            setDataError(error);
                                            rej(false);
                                        })
                                        .finally(() => {
                                            setIsLoading(false);
                                        });
                                } else {
                                    setDataError({ code: 'no-data-saved' });
                                    setConstantExpenses(modifiedExpenses);
                                    rej(false);
                                }
                            } catch (error) {
                                setDataError(error);
                                rej(false);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                    } catch (error) {
                        setDataError(error);
                        rej(false);
                    }
                });

            const result = await editConstantExpensePromise();

            return result;
        },
        [successMessage, constantExpenses, isVerified],
    );

    const deleteConstantExpense = useCallback(
        async (deletedExpense) => {
            if (!deletedExpense.id) {
                setDataError({ code: 'delete-expense-missing-id' });
                return false;
            }

            const connectionRef = ref(db, '.info/connected');
            const deleteConstantExpensePromise = async () =>
                await new Promise((res, rej) => {
                    let isFailedAttempt = false;

                    try {
                        onValue(connectionRef, (snapshot) => {
                            const isNetworkExist = snapshot.val();

                            if (!isNetworkExist) {
                                isFailedAttempt = true;
                                setDataError({
                                    code: 'no-network-users-settings',
                                });
                                rej(false);
                                return;
                            }

                            resetMessages();

                            // Making sure that settings
                            // are not saved in offline mode
                            if (isFailedAttempt) {
                                rej(false);
                                return;
                            }

                            // Paste into the array of data the expense replaced with new data
                            const expensesWithoutDeletedExpense =
                                constantExpenses.filter(
                                    (expense) =>
                                        expense.id !== deletedExpense.id,
                                );

                            try {
                                if (isVerified) {
                                    setIsLoading(true);
                                    set(
                                        ref(
                                            db,
                                            `${auth.currentUser?.uid}/constantExpenses`,
                                        ),
                                        expensesWithoutDeletedExpense,
                                    )
                                        .then(() => {
                                            setSuccessMessage({
                                                code: 'deleted-constant-expense',
                                            });
                                            res(true);
                                        })
                                        .catch((error) => {
                                            setDataError(error);
                                            rej(false);
                                        })
                                        .finally(() => {
                                            setIsLoading(false);
                                        });
                                } else {
                                    setDataError({ code: 'no-data-saved' });
                                    setConstantExpenses(
                                        expensesWithoutDeletedExpense,
                                    );
                                    rej(false);
                                }
                            } catch (error) {
                                setDataError(error);
                                rej(false);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                    } catch (error) {
                        setDataError(error);
                        rej(false);
                    }
                });

            const result = await deleteConstantExpensePromise();

            return result;
        },
        [successMessage, constantExpenses, isVerified],
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

        const plannedExpensesDayRange = getPlannedExpensesDatePeriod(
            plannedExpenseDayRefresh,
        );

        const constantExpensesTransactionsOnly = currentMonthExpenses.filter(
            (transaction) => transaction.constantExpenseId,
        );

        const noOneTimePassedExpenses = constantExpenses.filter(
            (constantExpense) =>
                constantExpense.isOneTime
                    ? isWithinInterval(
                          constantExpense.createdAt,
                          plannedExpensesDayRange,
                      )
                    : constantExpense,
        );

        const paidConstantExpenses = noOneTimePassedExpenses.filter(
            (constantExpense) =>
                constantExpensesTransactionsOnly.find(
                    (transaction) =>
                        transaction.constantExpenseId === constantExpense.id,
                ),
        );

        const notPaidConstantExpenses = noOneTimePassedExpenses.filter(
            (constantExpense) => {
                const isNotPaid = paidConstantExpenses.reduce(
                    (acc, transaction) =>
                        !acc || transaction.id === constantExpense.id
                            ? false
                            : true,
                    true,
                );

                return isNotPaid;
            },
        );

        setFilteredConstantExpenses({
            [paid]: paidConstantExpenses,
            [notPaid]: notPaidConstantExpenses,
        });
    }, [constantExpenses, currentMonthExpenses, plannedExpenseDayRefresh]);

    const addConstantExpenseIdToExistingTransaction = useCallback(
        async (transactionWithConstantId) => {
            if (
                !transactionWithConstantId.value ||
                !transactionWithConstantId.constantExpenseId
            )
                return;

            const connectionRef = ref(db, '.info/connected');
            const addConstantExpenseIdPromise = async () =>
                await new Promise((res, rej) => {
                    let isFailedAttempt = false;

                    try {
                        onValue(connectionRef, (snapshot) => {
                            const isNetworkExist = snapshot.val();

                            if (!isNetworkExist) {
                                isFailedAttempt = true;
                                setDataError({ code: 'no-network' });
                                rej(false);
                                return;
                            }

                            resetMessages();

                            // Making sure that transactions
                            // are not registred in offline mode
                            if (isFailedAttempt) return;

                            const updatedTransactions = transactions.map(
                                (transaction) =>
                                    transaction.id ===
                                    transactionWithConstantId.id
                                        ? transactionWithConstantId
                                        : transaction,
                            );

                            try {
                                if (isVerified) {
                                    setIsLoading(true);
                                    set(
                                        ref(
                                            db,
                                            `${auth.currentUser?.uid}/transactionsList`,
                                        ),
                                        updatedTransactions,
                                    )
                                        .then(() => {
                                            setSuccessMessage({
                                                code: 'constant-expense-marked-as-paid',
                                            });
                                            res(true);
                                        })
                                        .catch((error) => {
                                            setDataError(error);
                                            rej(false);
                                        })
                                        .finally(() => {
                                            setIsLoading(false);
                                        });
                                } else {
                                    setDataError({ code: 'no-data-saved' });
                                    setTransactions(updatedTransactions);
                                }
                            } catch (error) {
                                setDataError(error);
                                rej(false);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                    } catch (error) {
                        setDataError(error);
                        rej(false);
                    }
                });

            const result = await addConstantExpenseIdPromise();

            return result;
        },
        [successMessage, transactions, isVerified],
    );

    const doRegisterExpenseAsPaid = useCallback(
        async (constantExpense) => {
            const rangeAmount = 3000;
            const getMinAmount = (amount) =>
                amount - 3000 <= 0 ? 0 : amount - rangeAmount;
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

            const connectionRef = ref(db, '.info/connected');
            const payConstantExpensesPromise = async () =>
                await new Promise((res, rej) => {
                    let isFailedAttempt = false;

                    try {
                        onValue(connectionRef, (snapshot) => {
                            const isNetworkExist = snapshot.val();

                            if (!isNetworkExist) {
                                isFailedAttempt = true;
                                setDataError({ code: 'no-network' });
                                rej(false);
                                return;
                            }

                            resetMessages();

                            // Making sure that transactions
                            // are not registred in offline mode
                            if (isFailedAttempt) {
                                rej(false);
                                return;
                            }

                            try {
                                if (isVerified) {
                                    setIsLoading(true);
                                    set(
                                        ref(
                                            db,
                                            `${auth.currentUser?.uid}/transactionsList`,
                                        ),
                                        [...transactions, ...newTransactions],
                                    )
                                        .then(() => {
                                            setSuccessMessage({
                                                code: 'constant-expenses-paid',
                                            });
                                            res(true);
                                        })
                                        .catch((error) => {
                                            setDataError(error);
                                            rej(false);
                                        })
                                        .finally(() => {
                                            setIsLoading(false);
                                        });
                                } else {
                                    setDataError({ code: 'no-data-saved' });
                                    setTransactions([
                                        ...transactions,
                                        ...newTransactions,
                                    ]);
                                    rej(false);
                                }
                            } catch (error) {
                                setDataError(error);
                                rej(false);
                            } finally {
                                setIsLoading(false);
                            }
                        });
                    } catch (error) {
                        setDataError(error);
                        rej(false);
                    }
                });

            const result = await payConstantExpensesPromise();

            return result;
        },
        [successMessage, transactions, isVerified],
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
        await fetchAndUpdateConstantExpenses();
        await fetchAndUpdateTransactions();
        await fetchPlannedExpenseDayRefresh();
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
        fetchTransactions,
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
