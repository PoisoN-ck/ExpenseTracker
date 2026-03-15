import '../../styles/Application.scss';

import { useEffect, useState } from 'react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

import { AuthProvider, useAuthContext } from '@context/AuthContext';
import { translateMessage } from '@utils';
import ExpenseTracker from '@components/ExpenseTracker';
import Login from '@components/Login';
import SignUp from '@components/SignUp';
import Loader from '@components/common/Loader';

const ApplicationContent = () => {
    const [messageText, setMessageText] = useState('');

    const handleMessage = (message) => {
        setMessageText(translateMessage(message));
    };

    const removeMessageText = () => {
        setMessageText('');
    };

    const { authError, isLoginPending, isLoggedIn, logIn, signUp } =
        useAuthContext();

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
                        <Route path="/" element={<ExpenseTracker />} />
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

const Application = () => (
    <AuthProvider>
        <ApplicationContent />
    </AuthProvider>
);

export default Application;
