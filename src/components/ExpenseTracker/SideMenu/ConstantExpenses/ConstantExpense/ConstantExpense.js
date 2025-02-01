import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import { categoriesWithoutProfit } from '../../../../../constants';
import { ConstantExpense as ConstantExpenseType } from '../../../../../types';
import AmountInput from '../../../../common/AmountInput/AmountInput';
import Dropdown from '../../../../common/Dropdown/Dropdown';
import TextInput from '../../../../common/TextInput/TextInput';

const ConstantExpense = ({
    constantExpense,
    setConstantExpense,
    isDisabled,
}) => {
    const { name, amount, category, id } = constantExpense;
    const [expenseName, setExpenseName] = useState(name);
    const [expenseAmount, setExpenseAmount] = useState(amount);
    const [expenseCategory, setExpenseCategory] = useState(category);

    useEffect(() => {
        setExpenseName(name);
        setExpenseAmount(amount);
        setExpenseCategory(category);
    }, []);

    // Reset expense details when Edit mode is canceled
    useEffect(() => {
        if (isDisabled) {
            setExpenseName(name);
            setExpenseAmount(amount);
            setExpenseCategory(category);
        }
    }, [isDisabled]);

    useEffect(() => {
        const isSameData =
            name === expenseName &&
            amount === expenseAmount &&
            category === expenseCategory;

        if (!isSameData) {
            setConstantExpense({
                name: expenseName,
                amount: expenseAmount,
                category: expenseCategory,
                ...(id ? { id } : {}),
            });
        }
    }, [expenseName, expenseAmount, expenseCategory]);

    const handleNameChange = (e) => setExpenseName(e.target.value);
    const handleAmountChange = (value) => setExpenseAmount(value);
    const handleCategorySelect = (e) => setExpenseCategory(e.target.value);

    const categoryOptions = categoriesWithoutProfit.map((option) => (
        <option key={option} value={option}>
            {option}
        </option>
    ));

    return (
        <div className="flex-center-column full-width">
            <div className="flex-center gap-10 margin-vertical-sm full-width">
                <TextInput
                    isDisabled={isDisabled}
                    size="sm"
                    placeholder="Expense name"
                    value={expenseName}
                    handleChange={handleNameChange}
                />
                <AmountInput
                    isDisabled={isDisabled}
                    size="sm"
                    placeholder="Amount"
                    value={expenseAmount}
                    handleChange={handleAmountChange}
                />
            </div>
            <Dropdown
                isDisabled={isDisabled}
                isRounded
                options={categoryOptions}
                size="sm"
                style="margin-bottom-sm"
                selectedValue={expenseCategory}
                handleSelect={handleCategorySelect}
            />
        </div>
    );
};

ConstantExpense.propTypes = {
    constantExpense: ConstantExpenseType,
    setConstantExpense: PropTypes.func,
    isDisabled: PropTypes.bool,
};

export default ConstantExpense;
