import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import { useQuery, useMutation } from '@apollo/client'; // Import Apollo hooks
import { GET_ME } from '../utils/queries'; // Import GET_ME query
import { REMOVE_BOOK } from '../utils/mutations'; // Import REMOVE_BOOK mutation

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Use Apollo's useQuery hook to get the user data
  const { loading, data } = useQuery(GET_ME); // Use the GET_ME query to get the user data from the server and store it in the `data` variable when the query is finished loading
  const userData = data?.me || {}; // Destructure the user data from the query result and store it in a variable called `userData`

  // Use Apollo's useMutation hook for the REMOVE_BOOK mutation to remove a book from the user's saved books list
  const [removeBook] = useMutation(REMOVE_BOOK, {
    refetchQueries: [GET_ME], // Refetch the GET_ME query to update the user's saved books list after a book is removed
  });

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  // Function to handle deleting a book from the user's saved books list by its bookId
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null; // Get the user's token from Auth.js if it exists or return null if it doesn't

    if (!token) {
      return false; // If there is no token, return false and exit the function
    }

    try {
      // Call the REMOVE_BOOK mutation with the book ID value to remove the book from the user's saved books list
      const { data } = await removeBook({
        variables: { bookId }, // Pass the bookId as a variable to the mutation so the book can be removed
      });

      // Log the response data for debugging
      console.log('Mutation response:', data);

      // Check for errors in the response
      if (!data || !data.removeBook) {
        // If there's no data or the mutation response is empty or null
        throw new Error( // Throw an error with a message
          'No data returned from the mutation or mutation failed'
        );
      }

      // Remove the book's ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      // Log the error for debugging
      console.error('Error removing book:', err);

      // Optionally show a user-friendly error message
      alert('Failed to remove the book. Please try again later.');
    }
  };

  // if data isn't here yet, say so
  // If the data is still loading, display a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Container fluid className='text-light bg-dark p-5'>
        {' '}
        {/* Add a fluid container with a dark background and light text */}
        <h1>Viewing saved books!</h1>
      </Container>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
            // Col component represents a column with a book card, key is set to bookId for uniqueness
            <Col md='4' key={book.bookId}>
              <Card border='dark'>
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant='top'
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {/* Always show the View on Google Books button */}
                  <Button href={book.link} target='_blank'>
                    View on Google Books
                  </Button>
                  {/* Show the Save this Book button only if the user is logged in */}
                  <Button
                    className='btn-block btn-danger'
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
