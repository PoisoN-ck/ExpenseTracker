import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { categoriesWithoutProfit } from '@constants';
import { ConstantExpense as ConstantExpenseType } from '@types';
import AmountInput from '@components/common/AmountInput';
import Dropdown from '@components/common/Dropdown';
import TextInput from '@components/common/TextInput';

const ConstantExpense = ({
    constantExpense,
    setConstantExpense,
    isDisabled = false,
    isCreationMode = false,
}) => {
    const { name, amount, category, isOneTime, id } = constantExpense;
    const [expenseName, setExpenseName] = useState(name);
    const [expenseAmount, setExpenseAmount] = useState(amount);
    const [expenseCategory, setExpenseCategory] = useState(category);
    const [expenseIsOneTime, setExpenseIsOneTime] = useState(isOneTime);

    useEffect(() => {
        setExpenseName(name);
        setExpenseAmount(amount);
        setExpenseCategory(category);
        setExpenseIsOneTime(isOneTime);
    }, [name, amount, category, isOneTime]);

    // Reset expense details when Edit mode is canceled
    useEffect(() => {
        if (isDisabled) {
            setExpenseName(name);
            setExpenseAmount(amount);
            setExpenseCategory(category);
        }
    }, [isDisabled]);

    useEffect(() => {
        if (isCreationMode) {
            setConstantExpense({
                name: expenseName,
                amount: expenseAmount,
                category: expenseCategory,
                isOneTime: expenseIsOneTime,
            });

            return;
        }

        // For edit mode
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
    }, [
        expenseName,
        expenseAmount,
        expenseCategory,
        expenseIsOneTime,
        isCreationMode,
    ]);

    const handleNameChange = (e) => setExpenseName(e.target.value);
    const handleAmountChange = (value) => setExpenseAmount(value);
    const handleCategorySelect = (e) => setExpenseCategory(e.target.value);
    const handleCheckboxChange = (e) => setExpenseIsOneTime(e.target.checked);

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
                    placeholder="Expected amount"
                    value={expenseAmount}
                    handleChange={handleAmountChange}
                />
            </div>
            <div className="flex-center gap-10 full-width margin-bottom-sm">
                <Dropdown
                    isDisabled={isDisabled}
                    isRounded
                    options={categoryOptions}
                    size="sm"
                    selectedValue={expenseCategory}
                    handleSelect={handleCategorySelect}
                    placedholder="Select category"
                    style="flex-2"
                />
                {isCreationMode && (
                    <label className="flex-center gap-5 text-sm flex-align-center flex-1">
                        <input
                            type="checkbox"
                            checked={expenseIsOneTime}
                            onChange={handleCheckboxChange}
                            aria-label="One-time expense"
                        />
                        <span>One-time expense</span>
                    </label>
                )}
            </div>
        </div>
    );
};

ConstantExpense.propTypes = {
    constantExpense: ConstantExpenseType,
    setConstantExpense: PropTypes.func,
    isDisabled: PropTypes.bool,
    isCreationMode: PropTypes.bool,
    editMode: PropTypes.bool,
};

export default ConstantExpense;
