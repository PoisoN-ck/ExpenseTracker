import { child, get, onValue, ref, set } from 'firebase/database';
import { useCallback, useEffect, useState } from 'react';
import db, { auth } from '../services/db';

import { sendEmailVerification } from 'firebase/auth';
import { CONSTANT_EXPENSE_FILTERS, thisMonthFilter } from '../constants';
import { filterTransactions, sortTransactionsByDate } from '../utils';

const useData = (isVerified) => {
    // TODO: Potentially need separation of transactions, userSettings and constantExpenses to different files
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [usersSettings, setUsersSettings] = useState([]);
    const [constantExpenses, setConstantExpenses] = useState([]);
    const [filteredConstantExpense, setFilteredConstantExpenses] = useState({});
    const [thisMonthTransactions, setThisMonthTransactions] = useState([]);

    const resetMessages = () => {
        setDataError(null);
        setSuccessMessage(null);
    };

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
    const fetchAndUpdateTransactions = () => {
        try {
            const transactionsRef = ref(
                db,
                `${auth.currentUser?.uid}/transactionsList`,
            );

            onValue(
                transactionsRef,
                (snapshot) => {
                    const fetchedTransactions = snapshot
                        .val()
                        // Fallback if some transactions are manually deleted
                        ?.filter((transaction) => transaction)
                        .sort(sortTransactionsByDate);

                    if (fetchedTransactions?.length) {
                        setTransactions(fetchedTransactions);
                    }

                    setIsLoading(false);
                },
                (error) => {
                    setDataError(error);
                    setIsLoading(false);
                },
            );
        } catch (error) {
            setDataError(error);
            setIsLoading(false);
        }
    };

    const fetchAndUpdateUsersSettings = async () =>
        await new Promise((res, rej) => {
            try {
                const usersSettingsRef = ref(
                    db,
                    `${auth.currentUser?.uid}/usersSettings`,
                );

                onValue(
                    usersSettingsRef,
                    (snapshot) => {
                        const fetchedUsersSettings = snapshot
                            .val()
                            ?.filter((transaction) => transaction);

                        if (fetchedUsersSettings?.length) {
                            setUsersSettings(fetchedUsersSettings);
                            res(fetchedUsersSettings);
                        }
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
                        const fetchedConstantExpenses = snapshot
                            .val()
                            ?.filter((expense) => expense);

                        if (fetchedConstantExpenses?.length) {
                            setConstantExpenses(fetchedConstantExpenses);
                            res(fetchedConstantExpenses);
                        }
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
        [successMessage, transactions],
    );

    const addUserSettings = useCallback(
        async (userSetting) => {
            if (!userSetting.name || !userSetting.color) {
                setDataError({ code: 'add-missing-fields' });
                return false;
            }

            const connectionRef = ref(db, '.info/connected');

            const addUserSettingsPromise = async () =>
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
                                            `${auth.currentUser?.uid}/usersSettings`,
                                        ),
                                        [userSetting, ...usersSettings],
                                    )
                                        .then(() => {
                                            setSuccessMessage({
                                                code: 'added-user-settings',
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
                                        userSetting,
                                        ...usersSettings,
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

            const result = await addUserSettingsPromise();

            return result;
        },
        [successMessage, usersSettings],
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
                                        [constantExpense, ...constantExpenses],
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
                                    setTransactions([
                                        constantExpense,
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
        [successMessage, constantExpenses],
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
                                    setTransactions(modifiedExpenses);
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
        [successMessage, constantExpenses],
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
                                    setTransactions(
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
        [successMessage, constantExpenses],
    );

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

        const constantExpensesTransactionsOnly = thisMonthTransactions.filter(
            (transaction) =>
                transaction.transType === 'Expense' &&
                transaction.constantExpenseId,
        );

        const paidConstantExpenses = constantExpenses.filter(
            (constantExpense) =>
                constantExpensesTransactionsOnly.find(
                    (transaction) =>
                        transaction.constantExpenseId === constantExpense.id,
                ),
        );

        const notPaidConstantExpenses = constantExpenses.filter(
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
    }, [constantExpenses, transactions, thisMonthTransactions]);

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
                                                code: 'paid-constant-expense',
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
        [successMessage, transactions],
    );

    const doRegisterExpenseAsPaid = useCallback(
        async (constantExpense) => {
            const rangeAmount = 3000;
            const getMinAmount = (amount) =>
                amount - 3000 <= 0 ? 0 : amount - rangeAmount;
            const getMaxAmount = (amount) => amount + rangeAmount;

            const { amount, id, category } = constantExpense;

            const filteredTransactionsByCategory = thisMonthTransactions.filter(
                (transaction) => transaction.category === category,
            );

            if (filteredTransactionsByCategory.length) {
                const exactMatchExpense = filteredTransactionsByCategory.find(
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
                    filteredTransactionsByCategory.find((transaction) => {
                        const transValue = transaction.value * -1;

                        return (
                            getMinAmount(amount) <= transValue &&
                            transValue <= getMaxAmount(amount)
                        );
                    });

                if (potentialMatchExpense) {
                    const isPaid =
                        await addConstantExpenseIdToExistingTransaction({
                            ...potentialMatchExpense,
                            constantExpenseId: id,
                        });

                    return isPaid;
                }

                // If pontential match was not found - fallback option - take first transaction from this category
                const isPaid = await addConstantExpenseIdToExistingTransaction({
                    ...filteredTransactionsByCategory[0],
                    constantExpenseId: id,
                });

                return isPaid;
            }

            setDataError({ code: 'constant-expense-cannot-be-paid' });

            return false;
        },
        [thisMonthTransactions, addConstantExpenseIdToExistingTransaction],
    );

    const initialLoad = useCallback(async () => {
        await fetchAndUpdateUsersSettings();
        await fetchAndUpdateConstantExpenses();
        fetchAndUpdateTransactions();
    }, []);

    useEffect(() => {
        initialLoad();
    }, []);

    useEffect(() => {
        setThisMonthTransactions(
            filterTransactions(
                transactions,
                'date',
                JSON.stringify(thisMonthFilter),
            ),
        );
    }, [transactions]);

    useEffect(() => {
        updateFilteredConstantExpenses();
    }, [updateFilteredConstantExpenses]);

    return {
        dataError,
        isLoading,
        successMessage,
        transactions,
        usersSettings,
        constantExpenses,
        filteredConstantExpense,
        addTransaction,
        fetchTransactions,
        resetMessages,
        sendVerificationEmail,
        setDataError,
        addUserSettings,
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        doRegisterExpenseAsPaid,
    };
};

export default useData;
