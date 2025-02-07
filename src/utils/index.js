import { isWithinInterval } from 'date-fns';
import { FilterTypes } from '../constants';

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
            return 'Constant expense has been added successfully.';
        case 'edited-constant-expense':
            return 'Constant expense has been edited successfully.';
        case 'deleted-constant-expense':
            return 'Constant expense has been deleted successfully.';
        case 'delete-expense-missing-id':
            return 'Cannot delete expense without id.';
        case 'constant-expense-marked-as-paid':
            return 'Successfully registered Constant Expense as paid.';
        case 'constant-expense-cannot-be-paid':
            return "Cannot find any transaction of this category. Maybe, you didn't pay it?";
        case 'constant-expenses-paid':
            return "Cannot find any transaction of this category. Maybe, you didn't pay it?";

        default:
            return 'Something went wrong. Please try again.';
    }
};

export const convertToString = (num) => num.toLocaleString();
