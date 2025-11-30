import {
    endOfWeek,
    startOfMonth,
    startOfWeek,
    subMonths,
    subWeeks,
} from 'date-fns';

export const transactionTypes = ['Income', 'Expense'];

const currentDate = new Date();

export const datesFilters = [
    {
        name: 'Last Month',
        value: {
            start: startOfMonth(subMonths(currentDate, 1)),
            end: startOfMonth(currentDate),
        },
    },
    {
        name: 'This Month',
        value: {
            start: startOfMonth(currentDate),
            end: startOfMonth(subMonths(currentDate, -1)),
        },
    },
    {
        name: 'This Week',
        value: {
            start: startOfWeek(currentDate, { weekStartsOn: 1 }),
            end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        },
    },
    {
        name: 'Last Week',
        value: {
            start: subWeeks(startOfWeek(currentDate, { weekStartsOn: 1 }), 1),
            end: startOfWeek(currentDate, { weekStartsOn: 1 }),
        },
    },
];

export const { value: thisMonthFilter } = datesFilters.find(
    (dateFilter) => dateFilter.name === 'This Month',
);

export const categories = [
    'Profit',
    'Groceries',
    'Clothes',
    'Eateries',
    'Entertainment',
    'Utilities',
    'School',
    'Transport',
    'Self-care',
    'Presents',
    'Holidays',
    'Fees',
    'Pets',
    'Appliance',
];

export const categoriesWithoutProfit = categories.filter(
    (category) => category !== 'Profit',
);

export const DEFAULT_NUM_OF_TRANSACTIONS = 7;

export const FilterTypes = {
    CATEGORY: 'category',
    DATE: 'date',
    TYPE: 'type',
};

export const DEFAULT_FILTERS_STATE = {
    [FilterTypes.CATEGORY]: [],
    [FilterTypes.DATE]: [],
    [FilterTypes.TYPE]: [],
};

export const DEFAULT_LOGIN_DETAILS = {
    email: '',
    password: '',
    confirmPassword: '',
};

export const MAIN_COLOR = '#328dff';

export const INPUT_VARIANT_DICT = {
    blue: 'button--blue',
    white: 'button--white',
    'pure-white': 'button--pure-white',
};

export const INPUT_SIZE_DICT = {
    sm: 'input-field--sm',
    default: 'input-field',
    lg: 'input-field--lg', // does not exist yet
};

export const ALL = 'All';
export const NOT_PAID = 'Not paid';
export const PAID = 'Paid';
export const CONSTANT_EXPENSE_FILTERS = [ALL, NOT_PAID, PAID];

export const DAYS_LIST_IN_A_MONTH = Array.from(
    { length: 31 },
    (_, day) => day + 1,
);

export const DEFAULT_REFRESH_DAY = '1';

export const ONE_TIME_EXPENSE_TEXT = 'One-time';
export const RECURRING_EXPENSE_TEXT = 'Recurring';
export const MULTIPLE_EXPENSE_TEXT = 'Multiple';
