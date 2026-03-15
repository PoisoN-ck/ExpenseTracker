import PropTypes from 'prop-types';
import Notification from './Notification';
import { useAuthContext, useDataStatusContext } from '@context';
import { translateMessage } from '@utils';

const TrackerStatus = ({ isFilterApplied, resetFilters }) => {
    const { isVerified } = useAuthContext();
    const {
        dataError,
        isLoading,
        resetMessages,
        sendVerificationEmail,
        successMessage,
    } = useDataStatusContext();
    const messageText =
        dataError || successMessage
            ? translateMessage(dataError || successMessage)
            : null;

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
    isFilterApplied: PropTypes.bool.isRequired,
    resetFilters: PropTypes.func.isRequired,
};

export default TrackerStatus;
