import Container from "react-bootstrap/Container";

function NotLogged({ text }) {
    return (
        <Container className="d-flex align-items-center justify-content-center vh-100">
            <Container className="text-center">
                <h1 className="text-center"> {text} </h1>
            </Container>
        </Container>
    );
}

export default NotLogged;