import { child, get, onValue, ref, set } from 'firebase/database';
import { useCallback, useEffect, useState } from 'react';
import db, { auth } from '../services/db';

import { sendEmailVerification } from 'firebase/auth';
import { sortTransactionsByDate } from '../utils/utils';

const useData = (isVerified) => {
    const [testMessage, setTestMessage] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

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

    const addTransaction = useCallback(
        async (transaction) => {
            if (!transaction.value) return;

            resetMessages();

            try {
                if (isVerified) {
                    setIsLoading(true);
                    set(ref(db, `${auth.currentUser?.uid}/transactionsList`), [
                        transaction,
                        ...transactions,
                    ])
                        .then(() => {
                            setSuccessMessage({ code: 'added-transaction' });
                        })
                        .catch((error) => {
                            setTestMessage(error.toString());
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
                setTestMessage(error.toString());
                setDataError(error);
            } finally {
                setIsLoading(false);
            }
        },
        [successMessage, transactions],
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

    useEffect(() => {
        fetchAndUpdateTransactions();
    }, []);

    return {
        dataError,
        isLoading,
        successMessage,
        transactions,
        addTransaction,
        fetchTransactions,
        resetMessages,
        sendVerificationEmail,
        setDataError,
        testMessage,
    };
};

export default useData;
