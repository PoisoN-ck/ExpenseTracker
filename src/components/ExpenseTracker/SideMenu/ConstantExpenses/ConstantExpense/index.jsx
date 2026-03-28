import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
    categoriesWithoutProfit,
    TEMPORARY_EXPENSE_TEXT,
    MULTIPLE_EXPENSE_TEXT,
} from '@constants';
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
    const { name, amount, category, isTemporary, isMultiple } = constantExpense;
    const [expenseName, setExpenseName] = useState(name);
    const [expenseAmount, setExpenseAmount] = useState(amount);
    const [expenseCategory, setExpenseCategory] = useState(category);
    const [expenseIsTemporary, setExpenseIsTemporary] = useState(isTemporary);
    const [expenseIsMultiple, setExpenseIsMultiple] = useState(isMultiple);

    useEffect(() => {
        setExpenseName(name);
        setExpenseAmount(amount);
        setExpenseCategory(category);
        setExpenseIsTemporary(isTemporary);
        setExpenseIsMultiple(isMultiple);
    }, [name, amount, category, isTemporary, isMultiple]);

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
            isTemporary: expenseIsTemporary,
            isMultiple: expenseIsMultiple,
        }));
    }, [
        isCreationMode,
        expenseName,
        expenseAmount,
        expenseCategory,
        expenseIsTemporary,
        expenseIsMultiple,
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
                    <div className="flex-center gap-10 flex-1">
                        <label className="flex-center gap-5 text-sm flex-align-center">
                            <input
                                type="checkbox"
                                checked={expenseIsTemporary}
                                onChange={(e) =>
                                    setExpenseIsTemporary(e.target.checked)
                                }
                                aria-label={TEMPORARY_EXPENSE_TEXT}
                            />
                            <span className="text-muted">
                                {TEMPORARY_EXPENSE_TEXT}
                            </span>
                        </label>
                        <label className="flex-center gap-5 text-sm flex-align-center">
                            <input
                                type="checkbox"
                                checked={expenseIsMultiple}
                                onChange={(e) =>
                                    setExpenseIsMultiple(e.target.checked)
                                }
                                aria-label={MULTIPLE_EXPENSE_TEXT}
                            />
                            <span className="text-muted">
                                {MULTIPLE_EXPENSE_TEXT}
                            </span>
                        </label>
                    </div>
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
