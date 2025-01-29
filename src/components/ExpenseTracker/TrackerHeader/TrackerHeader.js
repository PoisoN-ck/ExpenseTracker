import React, { useMemo, useState } from 'react';

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
}) => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const balances = useMemo(() => {
        const result = {};

        shownTransactions.forEach((transaction) => {
            result[transaction.transType] =
                (result[transaction.transType]
                    ? result[transaction.transType]
                    : 0) + transaction.value;
        });

        return result;
    }, [shownTransactions]);

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
                balance={
                    (balances.Income ? balances.Income : 0) -
                    (balances.Expense ? balances.Expense * -1 : 0)
                }
                earnings={balances.Income ? balances.Income : 0}
                spendings={balances.Expense ? balances.Expense * -1 : 0}
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
};

export default TrackerHeader;
