import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as firebase from 'firebase/app';
import 'firebase/auth';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
    }
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleLogIn(event) {
    const { handleMessage } = this.props;
    const { email, password } = this.state;
    event.preventDefault();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => firebase.auth().signInWithEmailAndPassword(email, password))
      .then(() => this.setState({ email: '', password: '' }))
      .catch((error) => {
        handleMessage(error);
        this.setState({ password: '' });
      });
  }

  handleChange(event) {
    const { target } = event;
    const { value } = target;
    const { formcontrolname } = target.dataset;
    this.setState({ [formcontrolname]: value });
  }

  render() {
    const { messageText, removeMessageText } = this.props;
    const { email, password } = this.state;
    return (
      <div className="login-container">
        <div className="login-container__wrapper">
          <h1 className="login-container__heading">trakkex</h1>
          <div className="login-container__form-wrapper">
            <h2 className="text-align-center margin-vertical-sm login-container__subheading">Please log in</h2>
            <form className="login-container__form" noValidate="" onSubmit={this.handleLogIn}>
              <input className="login-container__form-item margin-vertical-sm" placeholder="Email" onChange={this.handleChange} value={email} data-formcontrolname="email" type="email" required="" />
              <input className="login-container__form-item margin-vertical-sm" placeholder="Password" onChange={this.handleChange} value={password} data-formcontrolname="password" type="password" required="" />
              <button onClick={removeMessageText} className="login-container__form-item login-container__submit button button--blue button--round margin-vertical-md" type="submit">Login</button>
            </form>
            <p className="warning text-align-center login-container__error">{messageText}</p>
          </div>
          <div>
            <p className="text-align-center padding-vertical-sm">
              Don&apos;t have an account?
              <Link onClick={removeMessageText} className="text-bold main-color padding-horizontal-xs" to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

Login.propTypes = {
  messageText: PropTypes.string.isRequired,
  handleMessage: PropTypes.func.isRequired,
  removeMessageText: PropTypes.func.isRequired,
};

export default Login
