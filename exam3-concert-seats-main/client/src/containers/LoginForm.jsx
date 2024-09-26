import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from "../API.jsx";
import { useState } from "react";
import ConcertNavbar from '../components/ConcertNavbar.jsx';
import { IoTicketSharp } from "react-icons/io5";

function LoginForm({ loginSuccessful, logout, user }) {

    const [username, setUsername] = useState('luigi@test.com');
    const [password, setPassword] = useState('pwd');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const doLogIn = (credentials) => {
        API.logIn(credentials)
            .then(user => {
                setErrorMessage('');
                loginSuccessful(user);
            })
            .catch(err => {
                setErrorMessage('Wrong username or password');
            })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage('');
        const credentials = { username, password };
        let valid = true;
        if (username === '' || password === '')
            valid = false;

        if (valid) {
            doLogIn(credentials);
        } else {
            setErrorMessage('Invalid username or password!')
        }
    };

    return (
        <>
            <ConcertNavbar logout={logout} user={user} />
            <Container className="text-center text-black mt-5">
                <Row>
                    <Col>
                        <h1>
                            <IoTicketSharp style={{ marginRight: '10px' }} />
                            Concert Booking
                        </h1>
                    </Col>
                </Row>
            </Container>
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "35vh" }}>
                <Row className="w-75">
                    <Col xs={{ span: 10, offset: 1 }} md={{ span: 6, offset: 3 }}>
                        <h2 className="text-center">Login</h2>
                        <Form onSubmit={handleSubmit}>
                            {errorMessage && (
                                <Alert variant='danger' dismissible onClick={() => setErrorMessage('')}>
                                    {errorMessage}
                                </Alert>
                            )}
                            <Form.Group controlId='username'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type='email'
                                    placeholder="Enter your email"
                                    value={username}
                                    onChange={ev => setUsername(ev.target.value)}
                                />
                            </Form.Group>
                            <Form.Group controlId='password' className="mt-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type='password'
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={ev => setPassword(ev.target.value)}
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-center mt-4">
                                <Button
                                    className='mx-2 btn-lg'
                                    type='submit'
                                    variant='outline-primary'
                                    style={{ borderRadius: "20px", padding: "10px 20px" }}
                                >
                                    Login
                                </Button>
                                <Button
                                    className='mx-2 btn-lg'
                                    variant='outline-danger'
                                    style={{ borderRadius: "20px", padding: "10px 20px" }}
                                    onClick={() => navigate('/concerts')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default LoginForm;
