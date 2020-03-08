import React, { Component } from 'react';
import {
  subMonths,
  startOfMonth,
  startOfWeek,
  subWeeks,
  isWithinRange,
} from 'date-fns';
import Balance from './Balance';
import Transactions from './Transactions';
import ActionBar from './ActionBar';
import Filter from './Filter';
import Modal from './Modal';

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
      name: 'Previous Month',
      value: {
        startDate: startOfMonth(subMonths(this.currentDate, 1)),
        endDate: startOfMonth(this.currentDate),
      },
    },
    {
      name: 'Current Month',
      value: {
        startDate: startOfMonth(this.currentDate),
        endDate: startOfMonth(subMonths(this.currentDate, -1)),
      },
    },
    {
      name: 'This Week',
      value: {
        startDate: startOfWeek(this.currentDate, { weekStartsOn: 1 }),
        endDate: this.currentDate,
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

  typeFilters = ['Income', 'Expense']

  defaultNumOfTrans = 10

  constructor() {
    super();
    this.state = {
      balance: 100000000,
      transactionsToShow: this.defaultNumOfTrans,
      isAllTransactionsShown: false,
      modals: {
        addTransactionModal: false,
        filtersModal: false,
      },
      isFilterApplied: false,
      transactions: [
        {
          value: 100,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 0, 1, 0, 0, 0),
        },
        {
          value: -20,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(2020, 0, 31, 23, 59, 59),
        },
        {
          value: 300,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 3, 23, 0, 0),
        },
        {
          value: -100,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 5),
        },
        {
          value: -10000,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 29, 11, 0, 0),
        },
        {
          value: 370000,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 24, 7, 0, 0),
        },
        {
          value: 100000,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 18, 7, 0, 0),
        },
        {
          value: 5000,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 18, 7, 0, 0),
        },
        {
          value: 100,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 0, 1, 0, 0, 0),
        },
        {
          value: -20,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(2020, 0, 31, 23, 59, 59),
        },
        {
          value: 300,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 3, 23, 0, 0),
        },
        {
          value: -100,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 5),
        },
        {
          value: -10000,
          category: 'Clothes',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 29, 11, 0, 0),
        },
        {
          value: 370000,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 24, 7, 0, 0),
        },
        {
          value: 100000,
          category: 'Profit',
          transType: 'Income',
          timestamp: new Date(2020, 1, 18, 7, 0, 0),
        },
        {
          value: 5000,
          category: 'Food',
          transType: 'Expense',
          timestamp: new Date(2020, 1, 18, 7, 0, 0),
        },
      ],
      filteredTransactions: [],
    }
    this.getLastRecords = this.getLastRecords.bind(this);
    this.getTransactionsBalance = this.getTransactionsBalance.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.filterTransactions = this.filterTransactions.bind(this);
    this.setFilterByCategory = this.setFilterByCategory.bind(this);
    this.setFilterByType = this.setFilterByType.bind(this);
    this.setFilterByDate = this.setFilterByDate.bind(this);
    this.resetFilters = this.resetFilters.bind(this);
    this.showAllTransactions = this.showAllTransactions.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
    this.handleFiltersShow = this.handleFiltersShow.bind(this);
  }

  componentDidMount() {
    this.resetFilters();
  }

  getLastRecords(num) {
    const { filteredTransactions } = this.state;
    return filteredTransactions.slice(-num);
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

  setFilterByDate(datesInterval) {
    const { transactions } = this.state;
    const { startDate, endDate } = JSON.parse(datesInterval);

    this.setState({
      filteredTransactions: transactions.filter(
        (transaction) => isWithinRange(transaction.timestamp, startDate, endDate),
      ),
      isFilterApplied: true,
    });
  }

  setFilterByCategory(category) {
    this.filterTransactions('category', category);
    this.setState({
      isFilterApplied: true,
    });
  }

  setFilterByType(type) {
    this.filterTransactions('transType', type);
    this.setState({
      isFilterApplied: true,
    });
  }

  filterTransactions(field, value) {
    const { transactions } = this.state;
    const filteredTransactions = transactions.filter(
      (transaction) => transaction[field] === value,
    );

    this.setState({ filteredTransactions });
  }

  resetFilters() {
    const { transactions } = this.state;

    this.setState({
      filteredTransactions: transactions,
      isFilterApplied: false,
    })
  }

  showAllTransactions() {
    const { transactions, isAllTransactionsShown } = this.state;

    if (isAllTransactionsShown) {
      this.setState({
        transactionsToShow: this.defaultNumOfTrans,
        isAllTransactionsShown: false,
      })
    } else {
      this.setState({
        transactionsToShow: transactions.length,
        isAllTransactionsShown: true,
      })
    }
  }

  addTransaction(transaction) {
    if (!transaction.value) return;

    const { transactions, balance } = this.state;

    this.setState({
      balance: balance + transaction.value,
      transactions: [...transactions, transaction],
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
      balance,
      transactionsToShow,
      isAllTransactionsShown,
      filteredTransactions,
      modals,
      isFilterApplied,
    } = this.state;

    const { filtersModal } = modals;

    const {
      categories,
      getLastRecords,
      addTransaction,
      setFilterByCategory,
      setFilterByType,
      setFilterByDate,
      resetFilters,
      getTransactionsBalance,
      datesFilters,
      typeFilters,
      showAllTransactions,
      defaultNumOfTrans,
      closeModal,
      openModal,
      handleFiltersShow,
    } = this;

    const balances = getTransactionsBalance();

    return (
      <>
        <header>
          <div className="filters-trigger container">
            <button className="filters-trigger__button" type="button" data-modal="filtersModal" onClick={handleFiltersShow}> </button>
          </div>
          {filtersModal && (
            <Modal modalName="filtersModal" closeModal={closeModal} title="Choose filter">
              <div className="filters">
                <Filter items={categories} setFilter={setFilterByCategory} />
                <Filter items={datesFilters} setFilter={setFilterByDate} />
                <Filter items={typeFilters} setFilter={setFilterByType} />
              </div>
            </Modal>
          )}
          <Balance
            balance={balance}
            earnings={balances.Income ? balances.Income : 0}
            spending={balances.Expense ? balances.Expense : 0}
          />
        </header>
        <div className="all-or-less-transactions">
          {filteredTransactions.length > defaultNumOfTrans
            ? <button type="button" className="button button--pure-white" onClick={showAllTransactions}>{isAllTransactionsShown ? 'View less transactions' : 'View all transactions'}</button>
            : null}
        </div>
        <Transactions transactionsList={getLastRecords(transactionsToShow)} />
        <div className="bottom-bar">
          {isFilterApplied ? <button className="reset-filters-button button button--blue button--round" type="button" onClick={resetFilters}>Reset Filters</button> : null}
          <ActionBar className="action-bar" addTransaction={addTransaction} categories={categories} closeModal={closeModal} openModal={openModal} modals={modals} />
        </div>
      </>
    );
  }
}

export default ExpenseTracker;
