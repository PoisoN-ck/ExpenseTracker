import { onValue, ref, runTransaction } from 'firebase/database';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import db, { auth } from '@/services/db';
import { sortTransactionsByDate } from '@utils';

const checkConnection = () =>
    new Promise((resolve) => {
        onValue(
            ref(db, '.info/connected'),
            (snapshot) => resolve(snapshot.val()),
            { onlyOnce: true },
        );
    });

const useTransactions = ({
    isVerified,
    setDataError,
    setSuccessMessage,
    resetMessages,
}) => {
    const [transactions, setTransactions] = useState([]);

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
                    setTransactions((prev) => [transaction, ...prev]);
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
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

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
                    setTransactions((prev) =>
                        prev.map((t) =>
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
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

    const payConstantExpenses = useCallback(
        async (constantExpensesToPay) => {
            if (!constantExpensesToPay.length) return;

            const newTransactions = constantExpensesToPay.map((expense) => ({
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
                    setTransactions((prev) => [...prev, ...newTransactions]);
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
            }
        },
        [isVerified, setDataError, setSuccessMessage, resetMessages],
    );

    const totalBalance = useMemo(
        () => transactions?.reduce((acc, t) => acc + t.value, 0) || 0,
        [transactions],
    );

    return {
        transactions,
        fetchAndUpdateTransactions,
        addTransaction,
        addConstantExpenseIdToExistingTransaction,
        payConstantExpenses,
        totalBalance,
    };
};

export default useTransactions;
