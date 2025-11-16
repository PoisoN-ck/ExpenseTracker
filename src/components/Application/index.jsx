import '../../styles/Application.scss';

import { useEffect, useState } from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

import useAuth from '@hooks/useAuth';
import { translateMessage } from '@utils';
import ExpenseTracker from '@components/ExpenseTracker';
import Login from '@components/Login';
import SignUp from '@components/SignUp';
import Loader from '@components/common/Loader';

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
    } = useAuth();

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
                    <Routes>
                        <Route
                            path="/signup"
                            element={<Navigate to="/" replace />}
                        />
                        <Route
                            path="/"
                            element={
                                <ExpenseTracker
                                    isVerified={isVerified}
                                    logOut={logOut}
                                />
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                ) : (
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Login
                                    logIn={logIn}
                                    removeMessageText={removeMessageText}
                                    messageText={messageText}
                                />
                            }
                        />
                        <Route
                            path="/signup"
                            element={
                                <SignUp
                                    handleMessage={handleMessage}
                                    removeMessageText={removeMessageText}
                                    messageText={messageText}
                                    signUp={signUp}
                                />
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                )}
            </Router>
        </div>
    );
};

export default Application;
