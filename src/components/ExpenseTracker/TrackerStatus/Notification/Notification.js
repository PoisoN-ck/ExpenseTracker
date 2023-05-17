import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import TransitionComponent from './TransitionComponent';

const Notification = ({ isError, isLoading, messageText, resetMessages }) => {
    const [isShown, setIsShown] = useState(false);
    const [severity, setSeverity] = useState(null);

    useEffect(() => {
        if (!isLoading) {
            setIsShown(Boolean(messageText));
        }
    }, [isLoading, messageText]);

    useEffect(() => {
        setSeverity(isError ? 'warning' : 'success');
    }, [isError]);

    const handleClose = () => {
        setIsShown(false);
        // To make sure notification doesn't
        // change color when in transition
        const resetMessagesLater = () => {
            let interval;
            interval = setInterval(() => {
                resetMessages();
                clearInterval(interval);
                interval = null;
            }, 500);
        };
        resetMessagesLater();
    };

    return (
        <Snackbar
            autoHideDuration={5000}
            onClose={handleClose}
            open={isShown}
            sx={{
                bottom: { xs: '75px' },
                left: { xs: '8px' },
            }}
            TransitionComponent={TransitionComponent}
        >
            <Alert
                onClose={handleClose}
                sx={{ width: '100%' }}
                variant="filled"
                severity={severity}
            >
                {messageText}
            </Alert>
        </Snackbar>
    );
};

Notification.propTypes = {
    isError: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    messageText: PropTypes.string,
    resetMessages: PropTypes.func.isRequired,
};

export default Notification;
