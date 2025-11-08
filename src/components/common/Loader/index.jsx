import PropTypes from 'prop-types';
import loading from '../../../img/loading.svg';

const COMPONENT_PROPS = {
    children: PropTypes.node,
    isLoading: PropTypes.bool.isRequired,
};

const Loader = ({ children, isLoading }) => {
    if (!children) {
        return (
            <div className="loader">
                <h1 className="login-container__heading">trakkex</h1>
                <img className="loader__image" src={loading} alt="Loader" />
            </div>
        );
    }

    return (
        <div className={`${isLoading ? 'loader' : ''}`}>
            {isLoading && (
                <div className="loader">
                    <img className="loader__image" src={loading} alt="Loader" />
                </div>
            )}
            {children}
        </div>
    );
};

Loader.propTypes = COMPONENT_PROPS;

export default Loader;
