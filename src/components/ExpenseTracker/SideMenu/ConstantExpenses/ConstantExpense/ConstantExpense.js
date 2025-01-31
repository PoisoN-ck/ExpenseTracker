import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import PropTypes from 'prop-types';
import { categoriesWithoutProfit } from '../../../../../constants';
import { ConstantExpense as ConstantExpenseType } from '../../../../../types';
import AmountInput from '../../../../common/AmountInput/AmountInput';
import Dropdown from '../../../../common/Dropdown/Dropdown';
import TextInput from '../../../../common/TextInput/TextInput';

const transactionId = uuidv4();

const ConstantExpense = ({
    constantExpense = {
        name: '',
        amount: '',
        selectedCategory: '',
        id: transactionId,
    },
    setConstantExpense,
    isEditMode,
}) => {
    const { name, amount, category } = constantExpense;
    const [expenseName, setExpenseName] = useState(name);
    const [expenseAmount, setExpenseAmount] = useState(amount);
    const [expenseCategory, setExpenseCategory] = useState(category);

    useEffect(() => {
        setExpenseAmount(amount);
    }, [amount]);

    useEffect(() => {
        setConstantExpense({
            name: expenseName,
            amount: expenseAmount,
            category: expenseCategory,
            // Make sure NOT to add id during Edit mode!
            ...(isEditMode ? {} : { id: transactionId }),
        });
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
        <div className="full-width">
            <div className="flex-center gap-10 margin-vertical-sm">
                <TextInput
                    size="sm"
                    placeholder="Expense name"
                    value={expenseName}
                    handleChange={handleNameChange}
                />
                <AmountInput
                    size="sm"
                    placeholder="Amount"
                    value={expenseAmount}
                    handleChange={handleAmountChange}
                />
            </div>
            <Dropdown
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
    isEditMode: PropTypes.bool,
};

export default ConstantExpense;
