import PropTypes from 'prop-types';
import { ConstantExpense } from '@types';
import AmountInput from '@components/common/AmountInput';
import ButtonIcon from '@components/common/ButtonIcon';
import ConstantExpenseBadges from '@components/common/ConstantExpenseBadges';
import MultipleExpenseProgress from '../../MultipleExpenseProgress';

const ConstantExpenseItem = ({
    expense,
    notPaidConstantExpenses,
    handleSelect,
    handleAmountChange,
}) => {
    const {
        id,
        name,
        category,
        amount,
        isSelected,
        isMultiple,
        isTemporary,
        paidAmount,
    } = expense;

    const totalAmountToBePaidForMultiple =
        notPaidConstantExpenses.find((e) => e.id === id)?.amount ?? amount;

    return (
        <li
            className={`pay-constant-expense__item margin-bottom-md  ${
                isSelected && 'shadow__highlighted'
            }`}
            key={id}
        >
            <ConstantExpenseBadges
                isReversed
                isMuted={!isSelected}
                isTemporary={isTemporary}
                isMultiple={isMultiple}
            />
            <div className="flex">
                <div className="pay-constant-expense__content-container flex flex-align-center gap-10 flex-2">
                    <ButtonIcon
                        icon={`fa-solid fa-square-check ${
                            !isSelected && 'button-icon__not-selected'
                        }`}
                        style="no-border"
                        handleClick={() => handleSelect(!isSelected, expense)}
                    />
                    <div className={!isSelected ? 'text-muted' : ''}>
                        <p className="text-sm text-bold margin-bottom-sm">
                            {name}
                        </p>
                        <p className="text-sm text-bold">
                            Category: {category}
                        </p>
                    </div>
                </div>
                <div className="flex-center-column text-center pay-constant-expense__amount-container flex-1-5">
                    <AmountInput
                        isDisabled={!isSelected}
                        style="pay-constant-expense__amount"
                        placeholder="Amount to be paid"
                        value={amount}
                        handleChange={(value) => handleAmountChange(value, id)}
                    />
                </div>
            </div>
            {isMultiple && (
                <MultipleExpenseProgress
                    isMuted={!isSelected}
                    paidAmount={paidAmount}
                    totalAmount={totalAmountToBePaidForMultiple}
                />
            )}
        </li>
    );
};

ConstantExpenseItem.propTypes = {
    expense: ConstantExpense.isRequired,
    notPaidConstantExpenses: PropTypes.arrayOf(ConstantExpense).isRequired,
    handleSelect: PropTypes.func.isRequired,
    handleAmountChange: PropTypes.func.isRequired,
};

export default ConstantExpenseItem;
