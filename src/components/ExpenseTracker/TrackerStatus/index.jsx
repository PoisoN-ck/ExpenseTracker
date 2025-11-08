import PropTypes from 'prop-types';
import Notification from './Notification';

const TrackerStatus = ({
    dataError,
    isLoading,
    isFilterApplied,
    isVerified,
    messageText,
    resetMessages,
    resetFilters,
    sendVerificationEmail,
}) => {
    return (
        <div className="bottom-bar">
            {isFilterApplied ? (
                <button
                    className="reset-filters-button button button--blue button--round"
                    type="button"
                    onClick={resetFilters}
                >
                    Reset Filters
                </button>
            ) : null}
            <Notification
                isLoading={isLoading}
                messageText={messageText}
                isError={!!dataError}
                resetMessages={resetMessages}
            />
            {isVerified ? null : (
                <div className="warning padding-vertical-md text-align-center">
                    <p>
                        <span className="warning text-bold">{'NOTE: '}</span>
                        You haven&apos;t verified your email address. No data
                        will be saved.
                        <button
                            type="button"
                            className="warning text-bold cursor-pointer padding-horizontal-xs button-to-text no-outline-on-focus underlined-text"
                            onClick={sendVerificationEmail}
                        >
                            Resend verification email
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
};

TrackerStatus.propTypes = {
    dataError: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    isFilterApplied: PropTypes.bool.isRequired,
    isVerified: PropTypes.bool.isRequired,
    messageText: PropTypes.string,
    resetMessages: PropTypes.func.isRequired,
    resetFilters: PropTypes.func.isRequired,
    sendVerificationEmail: PropTypes.func.isRequired,
};

export default TrackerStatus;
