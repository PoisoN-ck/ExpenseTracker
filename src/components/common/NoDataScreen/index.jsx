import PropTypes from 'prop-types';
import noTransactions from '../../../img/no-transactions.svg';

const NoDataScreen = ({ text, style }) => (
    <div className={`container ${style}`}>
        <img
            className="no-data-to-show-image"
            src={noTransactions}
            alt="No data to show"
        />
        <p className="no-data-to-show-text">{text}</p>
    </div>
);

NoDataScreen.propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.string,
};

export default NoDataScreen;
