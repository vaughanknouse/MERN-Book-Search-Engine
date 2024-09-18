// Define typeDefs for GraphQL schema
const typeDefs = `
  # Define the User type
  type User {
    _id: ID!
    username: String
    email: String
    bookCount: Int
    savedBooks: [Book]! # Array of Book type
  }

  # Define the Book type
  type Book {
    bookId: String! # Google's Book API ID
    authors: [String] # Array of strings for multiple authors
    description: String
    title: String
    image: String
    link: String
  }

  # Define the Auth type
  type Auth {
    token: ID!
    user: User
  }
    
  # Define input type for saving a book
  input BookInput {
    bookId: String!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }

  # Define Query type for returning the logged-in user (me)
  type Query {
    me: User
  }

  # Define Mutation type for authentication, adding users, and book-related operations
  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(input: BookInput!): User # Use BookInput for saving a book
    removeBook(bookId: String!): User
  }
`;

module.exports = typeDefs;
