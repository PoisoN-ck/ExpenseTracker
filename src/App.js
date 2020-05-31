import React from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import ExpenseTracker from './ExpenseTracker';
import Login from './Login';
import SignUp from './SignUp';
import './App.scss';
import loading from './img/loading.svg';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoggedIn: false,
      isLoading: true,
      messageText: '',
      isVerified: false,
    }
    this.checkIfLoggedIn = this.checkIfLoggedIn.bind(this);
    this.startLoading = this.startLoading.bind(this);
    this.stopLoading = this.stopLoading.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.resendVerificationEmail = this.resendVerificationEmail.bind(this);
    this.removeMessageText = this.removeMessageText.bind(this);
  }

  componentDidMount() {
    this.checkIfLoggedIn();
  }

  checkIfLoggedIn() {
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        isLoggedIn: Boolean(user),
        isLoading: false,
        isVerified: user?.emailVerified,
      });
    });
  }

  handleSignOut() {
    firebase.auth().signOut()
      .then(() => <Login />)
  }

  translateMessage(message) {
    switch (message.code) {
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/wrong-password':
        return 'User doesn\'t exist or password is incorrect';
      case 'email-sent':
        return 'Email has been sent successfully';
      case 'no-match':
        return 'Passwords do not match';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/email-already-in-use':
        return 'The email address is already in use';
      case 'auth/invalid-email':
        return 'The email address is empty';
      case 'auth/user-not-found':
        return 'User doesn\'t exist or password is incorrect';
      default:
        return 'Something went wrong. Please try again';
    }
  }

  handleMessage(message) {
    this.setState({
      messageText: this.translateMessage(message),
    });
  }

  removeMessageText() {
    this.setState({ messageText: '' });
  }

  resendVerificationEmail() {
    this.removeMessageText();
    const user = firebase.auth().currentUser;
    user.sendEmailVerification()
      .then(() => this.handleMessage({ code: 'email-sent' }))
      .catch(this.handleMessage);
  }

  startLoading() {
    this.setState({ isLoading: true });
  }

  stopLoading() {
    this.setState({ isLoading: false });
  }

  render() {
    const {
      startLoading,
      stopLoading,
      handleMessage,
      handleSignOut,
      resendVerificationEmail,
      removeMessageText,
    } = this;

    const {
      isLoggedIn,
      isLoading,
      messageText,
      isVerified,
    } = this.state;

    return (
      <div className="application-layout">
        {isLoading
        && (
          <div className="loader">
            <img className="loader__image" src={loading} alt="Loader" />
          </div>
        )}
        <Router>
          <Switch>
            { isLoggedIn
              ? (
                <>
                  <Redirect from="/signup" to="/" />
                  <Route path="/">
                    <ExpenseTracker
                      isVerified={isVerified}
                      resendEmail={resendVerificationEmail}
                      userId={firebase.auth().currentUser.uid}
                      startLoading={startLoading}
                      stopLoading={stopLoading}
                      handleSignOut={handleSignOut}
                      messageText={messageText}
                    />
                  </Route>
                </>
              )
              : (
                <>
                  <Route exact path="/"><Login handleMessage={handleMessage} removeMessageText={removeMessageText} messageText={messageText} /></Route>
                  <Route path="/signup"><SignUp handleMessage={handleMessage} removeMessageText={removeMessageText} messageText={messageText} /></Route>
                  <Redirect from="/" to="/" />
                </>
              )}
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
