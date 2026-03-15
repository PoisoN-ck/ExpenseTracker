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
    checkFirebaseConnection,
    getPlannedExpensesDatePeriod,
    fetchValueAsPromise,
    updateValueWithConnectionCheck,
} from '@utils';

const filterOutOneTimePassedExpenses = (expenses, dayRange) =>
    expenses.filter((expense) =>
        expense.isOneTime
            ? isWithinInterval(expense.createdAt, dayRange)
            : expense,
    );

const useConstantExpenses = ({
    isVerified,
    setDataError,
    setSuccessMessage,
    resetMessages,
}) => {
    const [constantExpenses, setConstantExpenses] = useState([]);
    const [filteredConstantExpense, setFilteredConstantExpenses] = useState({});
    const [plannedExpenseDayRefresh, setPlannedExpenseDayRefresh] =
        useState(null);

    const plannedExpenseDayFetch = useCallback(
        async () =>
            await fetchValueAsPromise({
                refPath: 'plannedExpenseDayRefresh',
                defaultValue: DEFAULT_REFRESH_DAY,
                onFetched: setPlannedExpenseDayRefresh,
                handleError: setDataError,
            }),
        [setDataError],
    );

    useEffect(() => {
        plannedExpenseDayFetch();
    }, [plannedExpenseDayFetch]);

    useEffect(() => {
        if (!plannedExpenseDayRefresh) return;

        const dayRange = getPlannedExpensesDatePeriod(plannedExpenseDayRefresh);
        const constantExpensesRef = ref(
            db,
            `${auth.currentUser?.uid}/constantExpenses`,
        );

        const unsubscribe = onValue(
            constantExpensesRef,
            (snapshot) => {
                const fetched =
                    snapshot.val()?.filter((expense) => expense) || [];
                setConstantExpenses(
                    filterOutOneTimePassedExpenses(fetched, dayRange),
                );
            },
            (error) => setDataError(error),
        );

        return unsubscribe;
    }, [plannedExpenseDayRefresh]);

    const updatePlannedExpenseDayRefresh = useCallback(
        async (day) => {
            if (!day) {
                setDataError({ code: 'add-missing-refresh-day' });
                return false;
            }

            const isDateUpdated = await updateValueWithConnectionCheck({
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

            if (isDateUpdated) setPlannedExpenseDayRefresh(day);
        },
        [
            isVerified,
            plannedExpenseDayRefresh,
            setDataError,
            setSuccessMessage,
            resetMessages,
            setPlannedExpenseDayRefresh,
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
                const isConnected = await checkFirebaseConnection();
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
                const isConnected = await checkFirebaseConnection();
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
                const isConnected = await checkFirebaseConnection();
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
        const dayRange = getPlannedExpensesDatePeriod(plannedExpenseDayRefresh);

        const paidConstantExpenses = constantExpenses.filter(
            (expense) =>
                expense.paidAt && isWithinInterval(expense.paidAt, dayRange),
        );

        const paidIds = new Set(
            paidConstantExpenses.map((expense) => expense.id),
        );
        const notPaidConstantExpenses = constantExpenses.filter(
            (expense) => !paidIds.has(expense.id),
        );

        setFilteredConstantExpenses({
            [paid]: paidConstantExpenses,
            [notPaid]: notPaidConstantExpenses,
        });
    }, [constantExpenses, plannedExpenseDayRefresh]);

    const markExpensesAsPaid = useCallback(
        async (expenses) => {
            const expensesArray = Array.isArray(expenses)
                ? expenses
                : [expenses];

            const paidAt = Date.now();
            const paidIds = new Set(expensesArray.map((expense) => expense.id));

            try {
                const isConnected = await checkFirebaseConnection();
                if (!isConnected) {
                    setDataError({ code: 'no-network-users-settings' });
                    return false;
                }

                resetMessages();

                if (!isVerified) {
                    setDataError({ code: 'no-data-saved' });
                    setConstantExpenses((prev) =>
                        prev.map((expense) =>
                            paidIds.has(expense.id)
                                ? { ...expense, paidAt }
                                : expense,
                        ),
                    );
                    return false;
                }

                await runTransaction(
                    ref(db, `${auth.currentUser?.uid}/constantExpenses`),
                    (currentList) => {
                        const existing = Array.isArray(currentList)
                            ? currentList.filter((expense) => expense)
                            : [];
                        return existing.map((expense) =>
                            paidIds.has(expense.id)
                                ? { ...expense, paidAt }
                                : expense,
                        );
                    },
                );
                setSuccessMessage({
                    code: 'constant-expense-marked-as-paid',
                });
                return true;
            } catch (error) {
                setDataError(error);
                return false;
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

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
        addConstantExpense,
        editConstantExpense,
        deleteConstantExpense,
        markExpensesAsPaid,
        updatePlannedExpenseDayRefresh,
    };
};

export default useConstantExpenses;
