import '../../styles/Application.scss';

import React, { useEffect, useState } from 'react';
import { Redirect, Route, BrowserRouter as Router } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import { translateMessage } from '../../utils';
import ExpenseTracker from '../ExpenseTracker/ExpenseTracker';
import Login from '../Login';
import SignUp from '../SignUp';
import Loader from '../common/Loader';

const Application = () => {
    const [messageText, setMessageText] = useState('');

    const handleMessage = (message) => {
        setMessageText(translateMessage(message));
    };

    const removeMessageText = () => {
        setMessageText('');
    };

    const {
        authError,
        isLoginPending,
        isLoggedIn,
        isVerified,
        logIn,
        logOut,
        signUp,
    } = useAuth(handleMessage, removeMessageText);

    useEffect(() => {
        if (authError) {
            setMessageText(translateMessage(authError));
        }
    }, [authError]);

    if (isLoginPending) {
        return <Loader isLoading={isLoginPending} />;
    }

    return (
        <div className="application-layout">
            <Router>
                {isLoggedIn ? (
                    <>
                        <Redirect from="/signup" to="/" />
                        <Route path="/" exact>
                            <ExpenseTracker
                                isVerified={isVerified}
                                logOut={logOut}
                            />
                        </Route>
                    </>
                ) : (
                    <>
                        <Route exact path="/">
                            <Login
                                handleMessage={handleMessage}
                                logIn={logIn}
                                removeMessageText={removeMessageText}
                                messageText={messageText}
                            />
                        </Route>
                        <Route path="/signup">
                            <SignUp
                                handleMessage={handleMessage}
                                removeMessageText={removeMessageText}
                                messageText={messageText}
                                signUp={signUp}
                            />
                        </Route>
                        <Redirect from="/" to="/" />
                    </>
                )}
            </Router>
        </div>
    );
};

export default Application;
