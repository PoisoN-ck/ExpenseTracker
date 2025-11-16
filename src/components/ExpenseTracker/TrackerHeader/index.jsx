import { useMemo, useState } from 'react';

import PropTypes from 'prop-types';
import { Filter, Transaction } from '../../../types';
import Balance from './Balance';
import FiltersModal from './FiltersModal';

const TrackerHeader = ({
    filters,
    setFilters,
    setIsFilterApplied,
    setFilteredTransactions,
    shownTransactions,
    transactions,
    setIsMenuShown,
    totalConstantExpensesToBePaid,
    freeCashAvailable,
    totalBalance,
    isDiffBalancesShown,
    totalConstantExpensesAmount,
}) => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // TODO: Move this to model with data?
    const balances = useMemo(
        () =>
            shownTransactions.reduce((acc, transaction) => {
                const currentTransTypeBalance = acc[transaction.transType] || 0;

                return {
                    ...acc,
                    [transaction.transType]:
                        currentTransTypeBalance + transaction.value,
                };
            }, 0),
        [shownTransactions],
    );

    const handleOpenFiltersModal = () => setIsFilterModalOpen(true);
    const handleCloseFiltersModal = () => setIsFilterModalOpen(false);
    const handleMenuShown = () => setIsMenuShown((prevState) => !prevState);

    return (
        <header>
            <div className="upper-menu container">
                <button
                    className="upper-menu__settings-trigger upper-menu__button"
                    type="button"
                    onClick={handleMenuShown}
                />
                <button
                    className="upper-menu__filter-trigger upper-menu__button"
                    type="button"
                    onClick={handleOpenFiltersModal}
                />
                {isFilterModalOpen && (
                    <FiltersModal
                        filters={filters}
                        transactions={transactions}
                        closeModal={handleCloseFiltersModal}
                        setIsFilterApplied={setIsFilterApplied}
                        setFilteredTransactions={setFilteredTransactions}
                        setFilters={setFilters}
                    />
                )}
            </div>
            <Balance
                earnings={balances.Income ? balances.Income : 0}
                spendings={balances.Expense ? balances.Expense * -1 : 0}
                totalConstantExpensesToBePaid={totalConstantExpensesToBePaid}
                freeCashAvailable={freeCashAvailable}
                totalBalance={totalBalance}
                isDiffBalancesShown={isDiffBalancesShown}
                totalConstantExpensesAmount={totalConstantExpensesAmount}
            />
        </header>
    );
};

TrackerHeader.propTypes = {
    filters: PropTypes.shape(Filter).isRequired,
    setFilters: PropTypes.func.isRequired,
    setIsFilterApplied: PropTypes.func.isRequired,
    setFilteredTransactions: PropTypes.func.isRequired,
    shownTransactions: PropTypes.arrayOf(Transaction).isRequired,
    transactions: PropTypes.arrayOf(Transaction).isRequired,
    setIsMenuShown: PropTypes.func.isRequired,
    totalConstantExpensesToBePaid: PropTypes.number.isRequired,
    freeCashAvailable: PropTypes.number.isRequired,
    totalBalance: PropTypes.number.isRequired,
    isDiffBalancesShown: PropTypes.bool.isRequired,
    totalConstantExpensesAmount: PropTypes.number.isRequired,
};

export default TrackerHeader;
