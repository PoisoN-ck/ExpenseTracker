import { database, initializeApp } from 'firebase';
import Rebase from 're-base';
import { fireBaseAPIKey } from './keys'

const firebaseApp = initializeApp({
  apiKey: fireBaseAPIKey,
  authDomain: 'trakkex.firebaseio.com/',
  databaseURL: 'https://trakkex.firebaseio.com/',
});

const base = Rebase.createClass(database());

export { firebaseApp };

export default base;
