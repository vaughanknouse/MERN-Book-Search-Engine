import './App.css';
import {
  ApolloClient, // Import the ApolloClient constructor
  InMemoryCache, // Import the InMemoryCache constructor
  ApolloProvider, // Import the ApolloProvider component
  createHttpLink, // Import the createHttpLink function
} from '@apollo/client'; // Import the Apollo Client functions and hooks
import { setContext } from '@apollo/client/link/context'; // Import the setContext function from Apollo Client
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';

// Construct our main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: '/graphql', // URL of the GraphQL server endpoint
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '', // Attach token to authorization header if available
    },
  };
});

// Create an Apollo Client instance
const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API
  link: authLink.concat(httpLink), // Chain the authLink middleware with the httpLink
  cache: new InMemoryCache(), // Cache query results in memory
});

// Main App component
function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
