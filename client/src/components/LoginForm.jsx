import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client'; // Import useMutation hook from Apollo Client

import { LOGIN_USER } from '../utils/mutations'; // Import the LOGIN_USER mutation
import Auth from '../utils/auth';

const LoginForm = () => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  // Set state for form validation
  const [validated] = useState(false);
  // Set state for alert
  const [showAlert, setShowAlert] = useState(false);

  // Use the LOGIN_USER mutation hook to log in the user
  const [login] = useMutation(LOGIN_USER);

  // Create a function to handle the form submission and update the state
  const handleInputChange = (event) => {
    const { name, value } = event.target; // Destructure the name and value properties from the event target
    setUserFormData({ ...userFormData, [name]: value }); // Update the form state with the new input
  };

  // Create a function to handle the form submission and call the loginUser mutation
  const handleFormSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form behavior

    // Check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget; // Get the current form
    if (form.checkValidity() === false) {
      // Check if the form is valid
      event.preventDefault(); // Prevent the default form behavior if the form is invalid
      event.stopPropagation(); // Stop the form propagation if it's invalid
    }

    try {
      // Call the LOGIN_USER mutation with the userFormData
      const { data } = await login({
        variables: { ...userFormData }, // Pass the form data as variables
      });

      Auth.login(data.login.token); // Log in the user with the token received from the server
    } catch (err) {
      // Catch any errors and log them to the console
      console.error(err);
    }

    // Reset form data after submission to clear the form
    setUserFormData({
      email: '',
      password: '',
    });
  };

  // Return the form with the input fields for email and password
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
          Something went wrong with your login credentials!
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
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
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
