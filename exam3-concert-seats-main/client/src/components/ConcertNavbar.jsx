import {Nav, Button, Container, Navbar} from 'react-bootstrap';
import { IoTicketSharp } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';

function ConcertNavbar({ logout, user }) {
    const navigate = useNavigate();
    const styles = {
        brand: {
            fontSize: "1.8rem",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center"
        },
        icon: {
            fontSize: "2rem",
            marginRight: "8px"
        },
        link: {
            color: "#f8f9fa",
            fontSize: "1.2rem",
            fontWeight: "500"
        },
        navbarText: {
            color: "#f8f9fa",
            fontSize: "1.1rem",
            marginRight: "15px"
        },
        button: {
            borderRadius: "20px",
            padding: "5px 15px"
        }
    };

    return (
        <Navbar bg="dark" variant="dark" sticky="top" expand="lg">
            <Container fluid>
                <Navbar.Brand as={Link} to="/" style={styles.brand}>
                    <IoTicketSharp style={styles.icon} />
                    Concert Seats
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbarScroll" />

                <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto" navbarScroll>
                        {user && (
                            <>
                                <Link className="nav-link" to="/book" style={styles.link}>
                                    Book a concert
                                </Link>
                                <Link className="nav-link" to="/reservations" style={styles.link}>
                                    My reservations
                                </Link>
                            </>
                        )}
                    </Nav>

                    <Nav>
                        {user ? (
                            <>
                                <Navbar.Text style={styles.navbarText}>
                                    Signed in as: <strong>{user.username}</strong>
                                </Navbar.Text>
                                <Button
                                    className="mx-2"
                                    variant="outline-light"
                                    onClick={logout}
                                    style={styles.button}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                className="mx-2"
                                variant="outline-light"
                                onClick={() => navigate('/login')}
                                style={styles.button}
                            >
                                Login
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default ConcertNavbar;
