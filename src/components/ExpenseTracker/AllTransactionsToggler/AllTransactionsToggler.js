import PropTypes from 'prop-types';
import React from 'react';
import { DEFAULT_NUM_OF_TRANSACTIONS } from '../../../constants';
import { Transaction } from '../../../types';

const AllTransactionsToggler = ({
    isShownAllTransactions,
    shownTransactions,
    toggleShowAllTransactions,
}) => {
    return (
        <div
            className={
                shownTransactions?.length > DEFAULT_NUM_OF_TRANSACTIONS
                    ? 'show-transactions'
                    : null
            }
        >
            {shownTransactions?.length > DEFAULT_NUM_OF_TRANSACTIONS ? (
                <button
                    type="button"
                    className="button button--pure-white"
                    onClick={toggleShowAllTransactions}
                >
                    {isShownAllTransactions
                        ? 'View less transactions'
                        : 'View all transactions'}
                </button>
            ) : null}
        </div>
    );
};

AllTransactionsToggler.propTypes = {
    isShownAllTransactions: PropTypes.bool.isRequired,
    shownTransactions: PropTypes.arrayOf(Transaction).isRequired,
    toggleShowAllTransactions: PropTypes.func.isRequired,
};

export default AllTransactionsToggler;
