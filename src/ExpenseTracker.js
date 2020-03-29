import React, { Component } from 'react';
import {
  subMonths,
  startOfMonth,
  startOfWeek,
  subWeeks,
  isWithinRange,
  endOfWeek,
} from 'date-fns';
import db from './db';
import { capitalize, sortTransactionsByDate } from './Helpers';
import Balance from './Balance';
import Transactions from './Transactions';
import ActionBar from './ActionBar';
import Filter from './Filter';
import Modal from './Modal';
import loading from './img/loading.svg'

class ExpenseTracker extends Component {
  currentDate = new Date();

  categories = [
    'Food',
    'Partying',
    'Clothes',
    'Flat',
    'Self-care',
    'Presents',
    'Holidays',
    'Fees',
  ]

  datesFilters = [
    {
      name: 'Last Month',
      value: {
        startDate: startOfMonth(subMonths(this.currentDate, 1)),
        endDate: startOfMonth(this.currentDate),
      },
    },
    {
      name: 'This Month',
      value: {
        startDate: startOfMonth(this.currentDate),
        endDate: startOfMonth(subMonths(this.currentDate, -1)),
      },
    },
    {
      name: 'This Week',
      value: {
        startDate: startOfWeek(this.currentDate, { weekStartsOn: 1 }),
        endDate: endOfWeek(this.currentDate, { weekStartsOn: 1 }),
      },
    },
    {
      name: 'Last Week',
      value: {
        startDate: subWeeks(startOfWeek(this.currentDate, { weekStartsOn: 1 }), 1),
        endDate: startOfWeek(this.currentDate, { weekStartsOn: 1 }),
      },
    },
  ]

  typeFilters = ['Income', 'Expense'];

  defaultNumOfTrans = 7;

  constructor() {
    super();
    this.state = {
      isLoading: true,
      isShowAllTransactions: false,
      modals: {
        addTransactionModal: false,
        filtersModal: false,
      },
      isFilterApplied: false,
      transactions: [],
      filteredTransactions: [],
      filters: {
        category: [],
        date: [],
        type: [],
      },
    }

    this.syncWithFirebase = this.syncWithFirebase.bind(this);
    this.getTransactionsBalance = this.getTransactionsBalance.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.setFilterByCategory = this.setFilterByCategory.bind(this);
    this.setFilterByType = this.setFilterByType.bind(this);
    this.setFilterByDate = this.setFilterByDate.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.toggleShowAllTransactions = this.toggleShowAllTransactions.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.handleFiltersShow = this.handleFiltersShow.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
  }

  componentDidMount() {
    this.getTransactionsFromDB()
      .then((transactionsFromDB) => {
        this.setState({
          transactions: transactionsFromDB.sort(sortTransactionsByDate),
          isLoading: false,
        }, () => {
          this.resetFilters();
          this.syncWithFirebase();
        });
      });
  }

  getTransactionsFromDB() {
    return db.fetch('transactionsList', {
      asArray: true,
    });
  }

  getTransactionsBalance() {
    const { filteredTransactions } = this.state;

    const result = {};

    filteredTransactions.forEach((transaction) => {
      result[transaction.transType] = (
        result[transaction.transType] ? result[transaction.transType] : 0) + transaction.value;
    });

    return result;
  }

  setFilterByDate(transactions, datesInterval) {
    const { startDate, endDate } = JSON.parse(datesInterval);

    return transactions.filter(
      (transaction) => isWithinRange(new Date(transaction.transDate), startDate, endDate),
    );
  }

  setFilterByCategory(transactions, category) {
    return transactions.filter(
      (transaction) => transaction.category === category,
    );
  }

  setFilterByType(transactions, type) {
    return transactions.filter(
      (transaction) => transaction.transType === type,
    );
  }

  syncWithFirebase() {
    db.syncState('transactionsList', {
      context: this,
      state: 'transactions',
      asArray: true,
    });
  }

  toggleFilter(filter) {
    const { filters } = this.state;

    if (filters[filter.name].includes(filter.value)) {
      filters[filter.name].splice(filters[filter.name].indexOf(filter.value), 1);
    } else {
      filters[filter.name].push(filter.value);
    }

    this.setState({ filters });
  }

  applyFilters() {
    const { filters, transactions } = this.state;
    let filteredTransactions = [];
    let isFiltered = false;

    Object.keys(filters).forEach((filterType) => {
      if (filters[filterType].length === 0) return;
      let filteredByType = [];
      filters[filterType].forEach((filter) => {
        const currentFilteredTransactions = this[`setFilterBy${capitalize(filterType)}`](filteredTransactions.length || isFiltered ? filteredTransactions : transactions, filter);
        filteredByType = [...currentFilteredTransactions, ...filteredByType];
      });
      filteredTransactions = [...filteredByType];
      isFiltered = true;
    });

    this.setState({
      filteredTransactions: isFiltered ? filteredTransactions : transactions,
      isFilterApplied: true,
    });

    this.closeModal('filtersModal');
  }

  resetFilters() {
    const { transactions } = this.state;

    this.setState({
      filteredTransactions: transactions,
      isFilterApplied: false,
      filters: {
        category: [],
        date: [],
        type: [],
      },
    })
  }

  toggleShowAllTransactions() {
    const { isShowAllTransactions } = this.state;

    this.setState({
      isShowAllTransactions: !isShowAllTransactions,
    })
  }

  addTransaction(transaction) {
    if (!transaction.value) return;

    const { transactions } = this.state;

    this.setState({
      transactions: [transaction, ...transactions],
    }, this.resetFilters);
  }

  closeModal(modalName) {
    const { modals } = this.state;

    modals[modalName] = false;
    this.setState({
      modals,
    });
  }

  openModal(modalName) {
    const { modals } = this.state;

    modals[modalName] = true;
    this.setState({
      modals,
    });
  }

  handleFiltersShow(event) {
    const { openModal } = this
    const { modal: modalName } = event.target.dataset;

    openModal(modalName);
  }

  render() {
    const {
      isShowAllTransactions,
      filteredTransactions,
      modals,
      isFilterApplied,
      filters,
      isLoading,
    } = this.state;

    const { filtersModal } = modals;

    const {
      categories,
      addTransaction,
      toggleFilter,
      resetFilters,
      getTransactionsBalance,
      datesFilters,
      typeFilters,
      toggleShowAllTransactions,
      defaultNumOfTrans,
      closeModal,
      openModal,
      handleFiltersShow,
      applyFilters,
    } = this;

    const balances = getTransactionsBalance();

    return (
      <>
        {isLoading
        && (
          <div className="loader">
            <img className="loader__image" src={loading} alt="Loader" />
          </div>
        )}
        <header>
          <div className="filters-trigger container">
            <button className="filters-trigger__button button" type="button" data-modal="filtersModal" onClick={handleFiltersShow}> </button>
          </div>
          {filtersModal && (
            <Modal modalName="filtersModal" closeModal={closeModal} title="Choose filter">
              <div className="filters">
                <Filter items={categories} filterName="category" setFilter={toggleFilter} activeFilters={filters.category} />
                <Filter items={datesFilters} filterName="date" setFilter={toggleFilter} activeFilters={filters.date} />
                <Filter items={typeFilters} filterName="type" setFilter={toggleFilter} activeFilters={filters.type} />
              </div>
              <div className="flex-center">
                <button type="button" className="button button--blue button--round padding-vertical-sm apply-button" onClick={applyFilters}>Apply filters</button>
              </div>
            </Modal>
          )}
          <Balance
            balance={
              (balances.Income ? balances.Income : 0)
              - (balances.Expense ? balances.Expense * -1 : 0)
            }
            earnings={balances.Income ? balances.Income : 0}
            spending={balances.Expense ? balances.Expense : 0}
          />
        </header>
        <div className={filteredTransactions.length > defaultNumOfTrans ? 'show-transactions' : null}>
          {filteredTransactions.length > defaultNumOfTrans
            ? <button type="button" className="button button--pure-white" onClick={toggleShowAllTransactions}>{isShowAllTransactions ? 'View less transactions' : 'View all transactions'}</button>
            : null}
        </div>
        <Transactions
          transactionsList={
            isShowAllTransactions
              ? filteredTransactions
              : filteredTransactions.slice(0, this.defaultNumOfTrans)
          }
        />
        <div className="bottom-bar">
          {isFilterApplied ? <button className="reset-filters-button button button--blue button--round" type="button" onClick={resetFilters}>Reset Filters</button> : null}
          <ActionBar className="action-bar" addTransaction={addTransaction} categories={categories} closeModal={closeModal} openModal={openModal} modals={modals} />
        </div>
      </>
    );
  }
}

export default ExpenseTracker;
