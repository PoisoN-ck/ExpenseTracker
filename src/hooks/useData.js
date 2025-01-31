import { child, get, onValue, ref, set } from 'firebase/database';
import { useCallback, useEffect, useState } from 'react';
import db, { auth } from '../services/db';

import { sendEmailVerification } from 'firebase/auth';
import { sortTransactionsByDate } from '../utils';

const useData = (isVerified) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [usersSettings, setUsersSettings] = useState([]);

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

    const fetchAndUpdateUsersSettings = () => {
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
                    }
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
            if (!userSetting.name || !userSetting.color) return;

            const connectionRef = ref(db, '.info/connected');

            let isFailedAttempt = false;

            try {
                onValue(connectionRef, (snapshot) => {
                    const isNetworkExist = snapshot.val();

                    if (!isNetworkExist) {
                        isFailedAttempt = true;
                        setDataError({ code: 'no-network-users-settings' });
                        return;
                    }

                    resetMessages();

                    // Making sure that settings
                    // are not saved in offline mode
                    if (isFailedAttempt) return;

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
                                })
                                .catch((error) => {
                                    setDataError(error);
                                })
                                .finally(() => {
                                    setIsLoading(false);
                                });
                        } else {
                            setDataError({ code: 'no-data-saved' });
                            setTransactions([userSetting, ...usersSettings]);
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
        [successMessage, usersSettings],
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
        fetchAndUpdateUsersSettings();
        fetchAndUpdateTransactions();
    }, []);

    return {
        dataError,
        isLoading,
        successMessage,
        transactions,
        usersSettings,
        addTransaction,
        fetchTransactions,
        resetMessages,
        sendVerificationEmail,
        setDataError,
        addUserSettings,
    };
};

export default useData;
