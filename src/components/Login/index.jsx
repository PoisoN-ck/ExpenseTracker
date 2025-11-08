import { useState } from 'react';

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Login = ({ messageText, logIn, removeMessageText }) => {
    const [userLoginData, setUserLoginData] = useState({
        email: '',
        password: '',
    });

    const handleLogIn = async (e) => {
        e.preventDefault();

        await logIn(userLoginData);
    };

    const handleChange = (e) => {
        const { dataset, value } = e.target;
        const { formcontrolname } = dataset;

        setUserLoginData((prevState) => ({
            ...prevState,
            [formcontrolname]: value,
        }));
    };

    const { email, password } = userLoginData;

    return (
        <div className="login-container">
            <div className="login-container__wrapper">
                <h1 className="login-container__heading">trakkex</h1>
                <div className="login-container__form-wrapper">
                    <h2 className="text-align-center margin-vertical-sm login-container__subheading">
                        Please log in
                    </h2>
                    <form
                        className="login-container__form"
                        noValidate=""
                        onSubmit={handleLogIn}
                    >
                        <input
                            className="login-container__form-item margin-vertical-sm"
                            placeholder="Email"
                            onChange={handleChange}
                            value={email}
                            data-formcontrolname="email"
                            type="email"
                            required=""
                        />
                        <input
                            className="login-container__form-item margin-vertical-sm"
                            placeholder="Password"
                            onChange={handleChange}
                            value={password}
                            data-formcontrolname="password"
                            type="password"
                            required=""
                        />
                        <button
                            onClick={removeMessageText}
                            className="login-container__form-item login-container__submit button button--blue button--round margin-vertical-md"
                            type="submit"
                        >
                            Login
                        </button>
                    </form>
                    <p className="warning text-align-center login-container__error">
                        {messageText}
                    </p>
                </div>
                <div>
                    <p className="text-align-center padding-vertical-sm">
                        {"Don't have an account?"}
                        <Link
                            onClick={removeMessageText}
                            className="text-bold main-color padding-horizontal-xs"
                            to="/signup"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

Login.propTypes = {
    messageText: PropTypes.string.isRequired,
    removeMessageText: PropTypes.func.isRequired,
    logIn: PropTypes.func.isRequired,
};

export default Login;
