import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { categoriesWithoutProfit } from '@constants';
import { ConstantExpense as ConstantExpenseType } from '@types';
import AmountInput from '@components/common/AmountInput';
import Dropdown from '@components/common/Dropdown';
import TextInput from '@components/common/TextInput';

const ConstantExpense = ({
    constantExpense,
    // WARNING! Multipurpose function - used for both creating and editing constant expense (state setter for New and callback for Edit)
    changeConstantExpense,
    isDisabled = false,
    isCreationMode = false,
}) => {
    const { name, amount, category, isOneTime } = constantExpense;
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

    // Creation mode
    useEffect(() => {
        if (!isCreationMode) return;

        changeConstantExpense((prev) => ({
            ...prev,
            name: expenseName,
            amount: expenseAmount,
            category: expenseCategory,
            isOneTime: expenseIsOneTime,
        }));
    }, [
        isCreationMode,
        expenseName,
        expenseAmount,
        expenseCategory,
        expenseIsOneTime,
    ]);

    // Edit mode
    useEffect(() => {
        if (isCreationMode) return;

        const isSameData =
            name === expenseName &&
            amount === expenseAmount &&
            category === expenseCategory;

        if (!isSameData) {
            changeConstantExpense({
                ...constantExpense,
                name: expenseName,
                amount: expenseAmount,
                category: expenseCategory,
            });
        }
    }, [
        isCreationMode,
        constantExpense,
        name,
        amount,
        category,
        expenseName,
        expenseAmount,
        expenseCategory,
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
                            aria-label="One-time"
                        />
                        <span className="text-muted">One-time</span>
                    </label>
                )}
            </div>
        </div>
    );
};

ConstantExpense.propTypes = {
    constantExpense: ConstantExpenseType,
    changeConstantExpense: PropTypes.func,
    isDisabled: PropTypes.bool,
    isCreationMode: PropTypes.bool,
    editMode: PropTypes.bool,
};

export default ConstantExpense;
