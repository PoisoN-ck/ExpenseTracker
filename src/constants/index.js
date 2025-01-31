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
            startDate: startOfMonth(subMonths(currentDate, 1)),
            endDate: startOfMonth(currentDate),
        },
    },
    {
        name: 'This Month',
        value: {
            startDate: startOfMonth(currentDate),
            endDate: startOfMonth(subMonths(currentDate, -1)),
        },
    },
    {
        name: 'This Week',
        value: {
            startDate: startOfWeek(currentDate, { weekStartsOn: 1 }),
            endDate: endOfWeek(currentDate, { weekStartsOn: 1 }),
        },
    },
    {
        name: 'Last Week',
        value: {
            startDate: subWeeks(
                startOfWeek(currentDate, { weekStartsOn: 1 }),
                1,
            ),
            endDate: startOfWeek(currentDate, { weekStartsOn: 1 }),
        },
    },
];

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
    lg: 'inpit-field--lg', // does not exist yet
};
