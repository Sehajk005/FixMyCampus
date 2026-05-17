import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import App from './App';
import './index.css';

console.log('[main.jsx] Script loaded');

try {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:5000/graphql',
    }),
    cache: new InMemoryCache(),
  });

  console.log('[main.jsx] ApolloClient created');

  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('[main.jsx] Root created');

  root.render(
    <React.StrictMode>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </React.StrictMode>
  );

  console.log('[main.jsx] render() called');
} catch (error) {
  console.error('[main.jsx] FATAL ERROR:', error);
  document.getElementById('root').innerHTML = `<pre style="color:red;padding:2rem;">${error.stack || error.message}</pre>`;
}
