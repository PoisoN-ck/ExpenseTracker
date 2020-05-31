import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as firebase from 'firebase/app';
import 'firebase/auth';

class SignUp extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
    }
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSignUp(event) {
    const { handleMessage } = this.props;
    const { email, password, confirmPassword } = this.state;
    event.preventDefault();
    if (password !== confirmPassword) {
      handleMessage({ code: 'no-match' });
      this.setState({ password: '', confirmPassword: '' });
      return;
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        const user = firebase.auth().currentUser;
        user.sendEmailVerification();
      })
      .then(() => this.setState({ email: '', password: '', confirmPassword: '' }))
      .catch((error) => {
        handleMessage(error);
        this.setState({ password: '', confirmPassword: '' });
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
    const { email, password, confirmPassword } = this.state;

    return (
      <div className="login-container">
        <div className="login-container__wrapper">
          <h1 className="login-container__heading">trakkex</h1>
          <div className="login-container__form-wrapper">
            <h2 className="text-align-center margin-vertical-sm login-container__subheading">Sign up</h2>
            <form className="login-container__form" noValidate="" onSubmit={this.handleSignUp}>
              <input className="login-container__form-item margin-vertical-sm" placeholder="Email" id="email" type="email" value={email} onChange={this.handleChange} data-formcontrolname="email" required="" />
              <input className="login-container__form-item margin-vertical-sm" placeholder="Password" id="password" type="password" value={password} onChange={this.handleChange} data-formcontrolname="password" required="" />
              <input className="login-container__form-item margin-vertical-sm" placeholder="Confirm password" id="confirmPassword" type="password" value={confirmPassword} onChange={this.handleChange} data-formcontrolname="confirmPassword" required="" />
              <button onClick={removeMessageText} className="login-container__form-item login-container__submit button button--blue button--round margin-vertical-md" type="submit">Create</button>
            </form>
            <p className="warning text-align-center login-container__error">{messageText}</p>
          </div>
          <div>
            <p className="text-align-center padding-vertical-sm">
              Already have an account?
              <Link onClick={removeMessageText} className="text-bold main-color padding-horizontal-xs" to="/">Login</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
}

SignUp.propTypes = {
  messageText: PropTypes.string.isRequired,
  handleMessage: PropTypes.func.isRequired,
  removeMessageText: PropTypes.func.isRequired,
};

export default SignUp
