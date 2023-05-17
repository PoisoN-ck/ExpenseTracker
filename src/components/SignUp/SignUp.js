import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DEFAULT_LOGIN_DETAILS } from '../../constants';

const SignUp = ({ handleMessage, messageText, removeMessageText, signUp }) => {
    const [loginDetails, setLoginDetails] = useState(DEFAULT_LOGIN_DETAILS);

    const resetPasswordField = () => {
        setLoginDetails((prevState) => ({
            ...prevState,
            password: '',
            confirmPassword: '',
        }));
    };

    const resetLoginDetails = () => {
        setLoginDetails(DEFAULT_LOGIN_DETAILS);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (loginDetails.password !== loginDetails.confirmPassword) {
            handleMessage({ code: 'no-match' });
            resetPasswordField();
            return;
        }

        const { email, password } = loginDetails;

        await signUp(email, password);

        resetLoginDetails();
    };

    const handleChange = (e) => {
        const { value } = e.target;
        const { formcontrolname } = e.target.dataset;

        setLoginDetails((prevState) => ({
            ...prevState,
            [formcontrolname]: value,
        }));
    };

    return (
        <div className="login-container">
            <div className="login-container__wrapper">
                <h1 className="login-container__heading">trakkex</h1>
                <div className="login-container__form-wrapper">
                    <h2 className="text-align-center margin-vertical-sm login-container__subheading">
                        Sign up
                    </h2>
                    <form
                        className="login-container__form"
                        noValidate=""
                        onSubmit={handleSignUp}
                    >
                        <input
                            className="login-container__form-item margin-vertical-sm"
                            placeholder="Email"
                            id="email"
                            type="email"
                            value={loginDetails.email}
                            onChange={handleChange}
                            data-formcontrolname="email"
                            required=""
                        />
                        <input
                            className="login-container__form-item margin-vertical-sm"
                            placeholder="Password"
                            id="password"
                            type="password"
                            value={loginDetails.password}
                            onChange={handleChange}
                            data-formcontrolname="password"
                            required=""
                        />
                        <input
                            className="login-container__form-item margin-vertical-sm"
                            placeholder="Confirm password"
                            id="confirmPassword"
                            type="password"
                            value={loginDetails.confirmPassword}
                            onChange={handleChange}
                            data-formcontrolname="confirmPassword"
                            required=""
                        />
                        <button
                            onClick={removeMessageText}
                            className="login-container__form-item login-container__submit button button--blue button--round margin-vertical-md"
                            type="submit"
                        >
                            Create
                        </button>
                    </form>
                    <p className="warning text-align-center login-container__error">
                        {messageText}
                    </p>
                </div>
                <div>
                    <p className="text-align-center padding-vertical-sm">
                        Already have an account?
                        <Link
                            onClick={removeMessageText}
                            className="text-bold main-color padding-horizontal-xs"
                            to="/"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

SignUp.propTypes = {
    messageText: PropTypes.string.isRequired,
    handleMessage: PropTypes.func.isRequired,
    removeMessageText: PropTypes.func.isRequired,
    signUp: PropTypes.func.isRequired,
};

export default SignUp;
