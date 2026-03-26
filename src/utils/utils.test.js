import { describe, it, expect, vi } from 'vitest';
import {
    isRealObject,
    capitalize,
    sortTransactionsByDate,
    filterTransactions,
    translateMessage,
    convertAmountToString,
    formatDayWithSuffix,
} from '@utils';
import { FilterTypes } from '@constants';

// ─── Firebase / db module mocks (utils imports them for checkFirebase/fetch) ──
vi.mock('@/services/db', () => ({
    default: {},
    auth: { currentUser: { uid: 'test-uid' } },
}));
vi.mock('firebase/database', () => ({
    onValue: vi.fn(),
    ref: vi.fn(),
    set: vi.fn(),
}));

// ─── isRealObject ─────────────────────────────────────────────────────────────

describe('isRealObject', () => {
    it('returns true for plain objects', () => {
        expect(isRealObject({ a: 1 })).toBe(true);
    });

    it('returns false for null', () => {
        expect(isRealObject(null)).toBe(false);
    });

    it('returns false for arrays', () => {
        expect(isRealObject([1, 2, 3])).toBe(false);
    });

    it('returns false for primitives', () => {
        expect(isRealObject('string')).toBe(false);
        expect(isRealObject(42)).toBe(false);
        expect(isRealObject(true)).toBe(false);
    });
});

// ─── capitalize ───────────────────────────────────────────────────────────────

describe('capitalize', () => {
    it('uppercases the first letter', () => {
        expect(capitalize('hello')).toBe('Hello');
    });

    it('leaves remaining letters unchanged', () => {
        expect(capitalize('hELLO')).toBe('HELLO');
    });

    it('handles single character', () => {
        expect(capitalize('a')).toBe('A');
    });

    it('handles empty string', () => {
        expect(capitalize('')).toBe('');
    });
});

// ─── sortTransactionsByDate ───────────────────────────────────────────────────

describe('sortTransactionsByDate', () => {
    it('sorts newer transactions first', () => {
        const older = { transDate: 1000 };
        const newer = { transDate: 2000 };
        const list = [older, newer].sort(sortTransactionsByDate);
        expect(list[0]).toBe(newer);
        expect(list[1]).toBe(older);
    });

    it('returns 0 for equal dates', () => {
        expect(
            sortTransactionsByDate({ transDate: 500 }, { transDate: 500 }),
        ).toBe(0);
    });
});

// ─── filterTransactions ───────────────────────────────────────────────────────

const sampleTransactions = [
    {
        id: '1',
        category: 'Rent',
        transType: 'Expense',
        transDate: new Date('2024-01-15').getTime(),
        value: -500,
    },
    {
        id: '2',
        category: 'Salary',
        transType: 'Income',
        transDate: new Date('2024-01-20').getTime(),
        value: 3000,
    },
    {
        id: '3',
        category: 'Rent',
        transType: 'Expense',
        transDate: new Date('2024-02-10').getTime(),
        value: -500,
    },
];

describe('filterTransactions – by category', () => {
    it('filters by category', () => {
        const result = filterTransactions(
            sampleTransactions,
            FilterTypes.CATEGORY,
            'Rent',
        );
        expect(result).toHaveLength(2);
        result.forEach((t) => expect(t.category).toBe('Rent'));
    });

    it('returns empty array for unknown category', () => {
        const result = filterTransactions(
            sampleTransactions,
            FilterTypes.CATEGORY,
            'Food',
        );
        expect(result).toHaveLength(0);
    });
});

describe('filterTransactions – by type', () => {
    it('filters by transaction type', () => {
        const result = filterTransactions(
            sampleTransactions,
            FilterTypes.TYPE,
            'Income',
        );
        expect(result).toHaveLength(1);
        expect(result[0].transType).toBe('Income');
    });
});

describe('filterTransactions – by date', () => {
    it('filters within date interval', () => {
        const interval = JSON.stringify({
            start: new Date('2024-01-01').toISOString(),
            end: new Date('2024-01-31').toISOString(),
        });
        const result = filterTransactions(
            sampleTransactions,
            FilterTypes.DATE,
            interval,
        );
        expect(result).toHaveLength(2);
        result.forEach((t) =>
            expect(t.transDate).toBeLessThanOrEqual(
                new Date('2024-01-31').getTime(),
            ),
        );
    });
});

// ─── translateMessage ─────────────────────────────────────────────────────────

describe('translateMessage', () => {
    it.each([
        [
            { code: 'auth/too-many-requests' },
            'Too many attempts. Please try again later.',
        ],
        [
            { code: 'auth/wrong-password' },
            "User doesn't exist or password is incorrect.",
        ],
        [
            { code: 'auth/weak-password' },
            'Password should be at least 6 characters.',
        ],
        [
            { code: 'auth/email-already-in-use' },
            'The email address is already in use.',
        ],
        [{ code: 'auth/invalid-email' }, 'The email entered is invalid.'],
        [{ code: 'auth/missing-email' }, 'The email address is empty.'],
        [
            { code: 'auth/user-not-found' },
            "User doesn't exist or password is incorrect.",
        ],
        [{ code: 'auth/missing-password' }, 'Please enter the password.'],
        [{ code: 'added-transaction' }, 'Transaction was added successfully.'],
        [
            { code: 'email-sent' },
            'Verification email has been resent successfully.',
        ],
        [{ code: 'no-match' }, 'Passwords do not match.'],
        [{ code: 'empty-value' }, 'Please enter transaction amount.'],
        [{ code: 'no-data-saved' }, 'No data was saved. Verify your email.'],
        [
            { code: 'no-network' },
            'Network issues. Transactions will not be saved.',
        ],
        [
            { code: 'added-user-settings' },
            'User settings has been added successfully.',
        ],
        [{ code: 'add-missing-fields' }, 'Please fill in all fields.'],
        [
            { code: 'added-constant-expense' },
            'Planned expense has been added successfully.',
        ],
        [
            { code: 'edited-constant-expense' },
            'Planned expense has been edited successfully.',
        ],
        [
            { code: 'deleted-constant-expense' },
            'Planned expense has been deleted successfully.',
        ],
        [
            { code: 'constant-expenses-paid' },
            'Successfully paid selected Planned Expenses.',
        ],
        [{ code: 'unknown-code' }, 'Something went wrong. Please try again.'],
    ])('translates %o correctly', (input, expected) => {
        expect(translateMessage(input)).toBe(expected);
    });
});

// ─── convertAmountToString ────────────────────────────────────────────────────

describe('convertAmountToString', () => {
    it('converts a number to a locale string', () => {
        expect(convertAmountToString(1000)).toBe((1000).toLocaleString());
    });

    it('defaults to 0 when no argument is passed', () => {
        expect(convertAmountToString()).toBe((0).toLocaleString());
    });
});

// ─── formatDayWithSuffix ──────────────────────────────────────────────────────

describe('formatDayWithSuffix', () => {
    it.each([
        [1, '1st of each month'],
        [2, '2nd of each month'],
        [3, '3rd of each month'],
        [4, '4th of each month'],
        [11, '11th of the month'],
        [12, '12th of the month'],
        [13, '13th of the month'],
        [21, '21st of each month'],
        [22, '22nd of each month'],
        [23, '23rd of each month'],
        [31, '31st of each month'],
    ])('formats day %d correctly', (day, expected) => {
        expect(formatDayWithSuffix(day)).toBe(expected);
    });

    it('returns empty string for invalid input', () => {
        expect(formatDayWithSuffix(0)).toBe('');
        expect(formatDayWithSuffix(32)).toBe('');
        expect(formatDayWithSuffix('abc')).toBe('');
    });
});
