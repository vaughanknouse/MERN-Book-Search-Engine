import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client'; // Import useMutation hook from Apollo Client
import { ADD_USER } from '../utils/mutations'; // Import the ADD_USER mutation

import Auth from '../utils/auth';

const SignupForm = () => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  // Set state for form validation
  const [validated] = useState(false);
  // Set state for alert
  const [showAlert, setShowAlert] = useState(false);

  // Use the ADD_USER mutation hook
  const [addUser] = useMutation(ADD_USER);

  const handleInputChange = (event) => {
    // Handle input changes in the form
    const { name, value } = event.target; // Destructure the name and value properties from the event target (input element)

    setUserFormData({ ...userFormData, [name]: value }); // Update the userFormData state with the new input value
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget; // Get the form element
    if (form.checkValidity() === false) {
      // Check if the form is valid
      event.preventDefault(); // Prevent form submission if form is invalid
      event.stopPropagation(); // Prevent default behavior
    }

    try {
      // Call the ADD_USER mutation with the userFormData
      const { data } = await addUser({
        // Destructure the data object from the response
        variables: { ...userFormData }, // Pass the form data as variables to the mutation
      });

      Auth.login(data.addUser.token); // Log in the user with the token received from the server
    } catch (err) {
      // Catch any errors and log them to the console
      console.error(err);
    }

    // Reset form data after submission to clear the form
    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  return (
    <>
      {/* This is needed for the validation functionality above */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* Show alert if server response is bad */}
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant='danger'
        >
          Something went wrong with your signup!
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='username'>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your username'
            name='username'
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type='invalid'>
            Username is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='email'
            placeholder='Your email address'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={
            !(
              userFormData.username &&
              userFormData.email &&
              userFormData.password
            )
          }
          type='submit'
          variant='success'
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
