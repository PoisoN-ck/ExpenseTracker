import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { fireBaseAPIKey } from '../keys';

const firebaseApp = initializeApp({
    apiKey: fireBaseAPIKey,
    authDomain: 'trakkex.firebaseio.com/',
    databaseURL: 'https://trakkex.firebaseio.com/',
    projectId: 'trakkex',
});

const db = getDatabase(firebaseApp);

const auth = getAuth();

export { firebaseApp, auth };

export default db;
