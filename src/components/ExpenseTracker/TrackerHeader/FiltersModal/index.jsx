import {
    FilterTypes,
    categories,
    datesFilters,
    transactionTypes as typeFilters,
} from '../../../../constants';

import PropTypes from 'prop-types';
import { filterTransactions } from '../../../../utils';
import Modal from '../../../common/Modal';
import FilterGroup from './FilterGroup';

const { CATEGORY, TYPE, DATE } = FilterTypes;

const FiltersModal = ({
    filters,
    setFilters,
    transactions,
    setIsFilterApplied,
    setFilteredTransactions,
    closeModal,
}) => {
    const applyFilters = () => {
        let filteredTransactions = [...transactions];

        Object.keys(filters).forEach((filterType) => {
            if (filters[filterType]?.length === 0) return;

            const filteredByType = filters[filterType].reduce(
                (acc, chosenFilter) => {
                    const filteredData = filterTransactions(
                        filteredTransactions,
                        filterType,
                        chosenFilter,
                    );
                    return [...acc, ...filteredData];
                },
                [],
            );

            // This returns unique transactions by id
            filteredTransactions = [
                ...new Map(
                    filteredByType.map((item) => [item.id, item]),
                ).values(),
            ];
        });

        setIsFilterApplied(true);
        setFilteredTransactions(filteredTransactions);
        closeModal();
    };

    const toggleFilter = (filter) => {
        const newFiltersShallowCopy = {
            ...Object.entries(filters).reduce(
                (acc, [filterCategory, filtersApplied]) => ({
                    ...acc,
                    [filterCategory]: [...filtersApplied],
                }),
                {},
            ),
        };

        if (newFiltersShallowCopy[filter.name].includes(filter.value)) {
            newFiltersShallowCopy[filter.name].splice(
                newFiltersShallowCopy[filter.name].indexOf(filter.value),
                1,
            );
        } else {
            newFiltersShallowCopy[filter.name].push(filter.value);
        }

        setFilters(newFiltersShallowCopy);
    };

    return (
        <Modal closeModal={closeModal} title="Choose filter">
            <div className="filters">
                <FilterGroup
                    items={categories}
                    filterName={CATEGORY}
                    setFilter={toggleFilter}
                    activeFilters={filters.category}
                />
                <FilterGroup
                    items={datesFilters}
                    filterName={DATE}
                    setFilter={toggleFilter}
                    activeFilters={filters.date}
                />
                <FilterGroup
                    items={typeFilters}
                    filterName={TYPE}
                    setFilter={toggleFilter}
                    activeFilters={filters.type}
                />
            </div>
            <div className="flex-center">
                <button
                    type="button"
                    className="button button--blue button--round padding-vertical-sm apply-button"
                    onClick={applyFilters}
                >
                    Apply filters
                </button>
            </div>
        </Modal>
    );
};

FiltersModal.propTypes = {
    closeModal: PropTypes.func.isRequired,
    filters: PropTypes.objectOf(PropTypes.any).isRequired,
    setFilters: PropTypes.func.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.any).isRequired,
    setIsFilterApplied: PropTypes.func.isRequired,
    setFilteredTransactions: PropTypes.func.isRequired,
};

export default FiltersModal;
