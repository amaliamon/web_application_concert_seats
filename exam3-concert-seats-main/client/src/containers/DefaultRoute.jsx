import Container from "react-bootstrap/Container";
import { Col, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import ConcertNavbar from "../components/ConcertNavbar.jsx";
import { useNavigate } from "react-router-dom";

export default function DefaultRoute({ logout, user }) {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate("/");
    };

    return (
        <>
            <ConcertNavbar logout={logout} user={user} />
            <Container className="text-center mt-5">
                <Row>
                    <Col>
                        <h1>404</h1>
                        <h3>We looked everywhere for this page. Are you sure the website URL is correct?</h3>
                        <p>Get in touch with the site owner.</p>
                        <Button variant="outline-danger" onClick={handleGoBack}>Go back to homepage</Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
