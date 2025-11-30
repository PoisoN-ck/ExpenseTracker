import { addMonths, isWithinInterval, lastDayOfMonth } from 'date-fns';
import { onValue, ref, set } from 'firebase/database';
import {
    FilterTypes,
    ONE_TIME_EXPENSE_TEXT,
    RECURRING_EXPENSE_TEXT,
} from '@constants';
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
    const { start, end } = JSON.parse(datesInterval);

    return transactions.filter((transaction) =>
        isWithinInterval(new Date(transaction.transDate), {
            start: new Date(start),
            end: new Date(end),
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

// Format a day number with the correct ordinal suffix and append "of the month".
export const formatDayWithSuffix = (day) => {
    const n = Number(day);
    if (Number.isNaN(n) || n < 1 || n > 31) return '';

    let remainder = n % 100;
    if (remainder >= 11 && remainder <= 13) {
        return `${n}th of the month`;
    }

    remainder = n % 10;
    let suffix;
    if (remainder === 1) suffix = 'st';
    else if (remainder === 2) suffix = 'nd';
    else if (remainder === 3) suffix = 'rd';
    else suffix = 'th';

    return `${n}${suffix} of each month`;
};

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

export const getPlannedExpensesDatePeriod = (startDate) => {
    if (!startDate) return { start: null, end: null };

    const day = parseInt(startDate, 10);
    if (Number.isNaN(day) || day < 1 || day > 31) {
        return { start: null, end: null };
    }

    const now = new Date();
    const todayDay = now.getDate();

    // If today's date is on/after the requested day, start a new period
    // from the requested day in the current month -> same day next month.
    // Otherwise, return the previous-month -> current-month range.
    if (todayDay >= day) {
        // start: requested day in current month (or last day if month too short)
        let start = new Date(now.getFullYear(), now.getMonth(), day);
        if (start.getMonth() !== now.getMonth()) {
            start = lastDayOfMonth(now);
        }

        // end: same day in next month (or last day of next month if needed)
        const nextMonth = addMonths(start, 1);
        let end = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
        if (end.getMonth() !== nextMonth.getMonth()) {
            end = lastDayOfMonth(nextMonth);
        }

        return { start, end };
    }

    // todayDay < day: previous-month -> current-month
    let end = new Date(now.getFullYear(), now.getMonth(), day);
    if (end.getMonth() !== now.getMonth()) {
        end = lastDayOfMonth(now);
    }

    const prevMonth = addMonths(end, -1);
    let start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
    if (start.getMonth() !== prevMonth.getMonth()) {
        start = lastDayOfMonth(prevMonth);
    }

    return { start, end };
};

export const getPlannedExpenseType = (expense) => {
    if (!expense) return;

    if (expense.isOneTime) {
        return ONE_TIME_EXPENSE_TEXT;
    }

    return RECURRING_EXPENSE_TEXT;
};
