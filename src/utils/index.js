import { isWithinInterval } from 'date-fns';
import { onValue, ref, set } from 'firebase/database';
import { FilterTypes } from '@constants';
import db, { auth } from '@/services/db';

export const isRealObject = (value) =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

export function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function sortTransactionsByDate(currentTrans, nextTrans) {
    return nextTrans.transDate - currentTrans.transDate;
}

const filterByDate = (transactions, datesInterval) => {
    const { startDate, endDate } = JSON.parse(datesInterval);

    return transactions.filter((transaction) =>
        isWithinInterval(new Date(transaction.transDate), {
            start: new Date(startDate),
            end: new Date(endDate),
        }),
    );
};

const filterByCategory = (transactions, category) => {
    return transactions.filter(
        (transaction) => transaction.category === category,
    );
};

const filterByType = (transactions, type) => {
    return transactions.filter((transaction) => transaction.transType === type);
};

export const filterTransactions = (transactions, filterType, chosenFilters) => {
    if (filterType === FilterTypes.CATEGORY) {
        return filterByCategory(transactions, chosenFilters);
    }

    if (filterType === FilterTypes.TYPE) {
        return filterByType(transactions, chosenFilters);
    }

    if (filterType === FilterTypes.DATE) {
        return filterByDate(transactions, chosenFilters);
    }
};

export const translateMessage = (message) => {
    switch (message.code) {
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/wrong-password':
            return "User doesn't exist or password is incorrect.";
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/email-already-in-use':
            return 'The email address is already in use.';
        case 'auth/invalid-email':
            return 'The email entered is invalid.';
        case 'auth/missing-email':
            return 'The email address is empty.';
        case 'auth/user-not-found':
            return "User doesn't exist or password is incorrect.";
        case 'auth/missing-password':
            return 'Please enter the password.';

        case 'added-transaction':
            return 'Transaction was added successfully.';
        case 'email-sent':
            return 'Verification email has been resent successfully.';
        case 'no-match':
            return 'Passwords do not match.';
        case 'empty-value':
            return 'Please enter transaction amount.';
        case 'no-data-saved':
            return 'No data was saved. Verify your email.';
        case 'no-network':
            return 'Network issues. Transactions will not be saved.';
        case 'no-network-users-settings':
            return 'Network issues. User settings will not be saved.';
        case 'added-user-settings':
            return 'User settings has been added successfully.';
        case 'add-missing-fields':
        case 'edit-missing-field':
            return 'Please fill in all fields.';
        case 'added-constant-expense':
            return 'Planned expense has been added successfully.';
        case 'edited-constant-expense':
            return 'Planned expense has been edited successfully.';
        case 'deleted-constant-expense':
            return 'Planned expense has been deleted successfully.';
        case 'delete-expense-missing-id':
            return 'Cannot delete expense without id.';
        case 'constant-expense-marked-as-paid':
            return 'Successfully registered Planned Expense as paid.';
        case 'constant-expense-cannot-be-paid':
            return "Cannot find any transaction of this category. Maybe, you didn't pay it?";
        case 'constant-expenses-paid':
            return 'Successfully paid selected Planned Expenses.';
        case 'add-missing-refresh-day':
            return 'Please select a day for planned expense refresh.';
        case 'updated-planned-expense-day-refresh':
            return 'Planned expense refresh day has been updated successfully.';
        default:
            return 'Something went wrong. Please try again.';
    }
};

export const convertAmountToString = (num = 0) => num?.toLocaleString();

const handleSnapshotValue = (snapshot, defaultValue = null) => {
    if (Array.isArray(snapshot?.val())) {
        return snapshot?.val().filter((value) => value) || [];
    }

    return snapshot?.val() || defaultValue;
};

export const fetchValueAsPromise = async ({
    refPath,
    defaultValue = null,
    onFetched,
    handleError,
}) =>
    await new Promise((res, rej) => {
        try {
            const nodeRef = ref(db, `${auth.currentUser?.uid}/${refPath}`);

            onValue(
                nodeRef,
                (snapshot) => {
                    const fetchedValue = handleSnapshotValue(
                        snapshot,
                        defaultValue,
                    );

                    if (typeof onFetched === 'function') {
                        onFetched(fetchedValue);
                    }

                    res(fetchedValue);
                },
                (error) => {
                    handleError(error);
                    rej(false);
                },
            );
        } catch (error) {
            handleError(error);
            rej(false);
        }
    });

export const updateValueWithConnectionCheck = async ({
    path,
    value,
    isVerified,
    oldValue = null,
    successCode,
    resetMessages,
    setSuccessMessage,
    setError,
    restoreOnFail,
}) =>
    await new Promise((res, rej) => {
        let isFailedAttempt = false;

        const connectionRef = ref(db, '.info/connected');

        try {
            onValue(connectionRef, (snapshot) => {
                const isNetworkExist = snapshot.val();

                if (!isNetworkExist) {
                    isFailedAttempt = true;
                    setError({ code: 'no-network-users-settings' });
                    rej(false);
                    return;
                }

                resetMessages();

                if (isFailedAttempt) {
                    rej(false);
                    return;
                }

                try {
                    if (isVerified) {
                        let updatedValue = handleValueTypes(value, oldValue);

                        set(
                            ref(db, `${auth.currentUser?.uid}/${path}`),
                            updatedValue,
                        )
                            .then(() => {
                                setSuccessMessage({ code: successCode });
                                res(true);
                            })
                            .catch((error) => {
                                setError(error);
                                rej(false);
                            });
                    } else {
                        setError({ code: 'no-data-saved' });
                        if (typeof restoreOnFail === 'function') {
                            restoreOnFail();
                        }
                        rej(false);
                    }
                } catch (error) {
                    setError(error);
                    rej(false);
                }
            });
        } catch (error) {
            setError(error);
            rej(false);
        }
    });

const handleValueTypes = (value, oldValue = null) => {
    if (Array.isArray(value)) {
        return [...oldValue, ...value];
    }

    if (isRealObject(value)) {
        return { ...oldValue, ...value };
    }

    return value;
};
