import { useState, useEffect } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';

import { useMutation } from '@apollo/client'; // Import useMutation hook from Apollo Client
import { SAVE_BOOK } from '../utils/mutations'; // Import the SAVE_BOOK mutation

import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API'; // Import the searchGoogleBooks function to search for books in the Google Books API
import { saveBookIds, getSavedBookIds } from '../utils/localStorage'; // Import helper functions to work with local storage

const SearchBooks = () => {
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');

  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // Apollo useMutation hook for the SAVE_BOOK mutation
  const [saveBook] = useMutation(SAVE_BOOK);

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds); // Save the `savedBookIds` list to localStorage
  }, [savedBookIds]); // Run only when savedBookIds changes

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from submitting by default

    if (!searchInput) {
      return false; // If there is no search input, return false
    }

    try {
      const response = await searchGoogleBooks(searchInput); // Call the searchGoogleBooks function with the `searchInput` value

      if (!response.ok) {
        throw new Error('something went wrong!'); // If the response is not ok, throw an error
      }

      const { items } = await response.json(); // Deconstruct the `items` property from the response object and store it in a variable

      // Map through the `items` array and store the book data in a new array
      const bookData = items.map((book) => ({
        bookId: book.id, // Store the book's id
        authors: book.volumeInfo.authors || ['No author to display'], // Store the book's authors or a message if there are no authors
        title: book.volumeInfo.title, // Store the book's title
        description: book.volumeInfo.description, // Store the book's description
        image: book.volumeInfo.imageLinks?.thumbnail || '', // Store the book's image or an empty string if there is no image
        link: book.volumeInfo.infoLink, // Store the book's info link to view more information about the book
      }));

      setSearchedBooks(bookData); // Set the `searchedBooks` state to the new array of book data
      setSearchInput(''); // Clear the search input value
    } catch (err) {
      // Catch any errors and log them to the console
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false; // If there is no token, return false
    }

    try {
      // Provide a default value for description if it's missing from the book data
      const bookWithDefaultDescription = {
        // Create a new object with the book data and a default description
        ...bookToSave, // Spread the bookToSave object into a new object
        description: bookToSave.description || 'No description available', // Set a default description if none exists
      };

      // Call the SAVE_BOOK mutation with the book data and token
      const { data } = await saveBook({
        // Destructure the `data` object from the response returned by the `saveBook` mutation
        variables: { input: bookWithDefaultDescription }, // Pass the book data to the mutation as the `input` variable
      });

      console.log(data); // Log the response data to the console

      // if book successfully saves to user's account, save book id to state
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err); // Catch any errors and log them to the console
    }
  };

  // Return the JSX for the SearchBooks component
  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md='4' key={book.bookId}>
                {' '}
                {/* Set the key to the book's `bookId` */}
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
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds.includes(book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}
                      >
                        {savedBookIds.includes(book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
