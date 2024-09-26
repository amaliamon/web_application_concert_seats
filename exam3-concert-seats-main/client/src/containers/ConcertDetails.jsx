import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import ConcertNavbar from "../components/ConcertNavbar.jsx";
import API from "../API.jsx";
import { FaArrowLeft } from "react-icons/fa";
import dayjs from 'dayjs';

function ConcertDetail({ logout, user }) {
    const [concert, setConcert] = useState(null);
    const { concert_id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        API.listConcertSeats(concert_id)
            .then((concert) => {
                concert.onset = dayjs(concert.onset);
                setConcert(concert);
                setShowLoader(false);
            })
            .catch((e) => {
                if (e.error) {
                    setError(e.error);
                } else {
                    if (e.errors && e.errors[0]) {
                        setError(e.errors[0].msg);
                    }
                }
                setShowLoader(false);
            });
    }, [concert_id]);

    const renderSeats = (rows, columns) => {
        const seatRows = [];

        for (let row = 1; row <= rows; row++) {
            const seatColumns = [];

            for (let seat = 1; seat <= columns; seat++) {
                const seatNumber = `${row}${String.fromCharCode(64 + seat)}`;
                const isOccupied = concert?.seats?.includes(seatNumber);  // check if the seat is already occupied
                const seatClassName = isOccupied ? 'seat bg-secondary text-light' : 'seat bg-light text-dark';

                seatColumns.push(
                    <Col
                        key={seatNumber}
                        className="p-2"
                        style={{ maxWidth: `${100 / columns}%` }}
                    >
                        <Card
                            className={seatClassName}
                            style={{
                                height: '40px', width: '40px', display: 'flex',
                                justifyContent: 'center', alignItems: 'center',
                            }}
                        >
                            <Card.Body
                                style={{
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0
                                }}
                            >
                                <Card.Title style={{ fontSize: '1.5rem', margin: 0 }}>
                                    {seatNumber}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            }

            seatRows.push(
                <Row key={row} className="justify-content-center mb-2">
                    {seatColumns}
                </Row>
            );
        }

        return seatRows;
    };
    const totalSeats = (concert?.rows * concert?.columns) || 0;
    const totalOccupiedSeats = concert?.seats?.length || 0;

    return (
        <>
            <ConcertNavbar logout={logout} user={user} />
            {showLoader ? (
                <div className="d-flex align-items-center justify-content-center vh-100">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                !error ? (
                    <Container>
                        <div className="mt-3 mb-4">
                            <Button
                                style={{ borderRadius: "20px", padding: "5px 15px" }}
                                variant="outline-dark"
                                onClick={() => navigate("/")}
                                className="px-4 py-2 fs-5"
                            >
                                <FaArrowLeft /> Back to Concerts
                            </Button>
                        </div>
                        <Card className="p-3 mb-4" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                            <Card.Body >
                                <Card.Title className="fs-2 text-center">{concert?.name}</Card.Title>
                                <Row>
                                    <Col md={6}>
                                        <p className="fs-4"><strong>Location:</strong> {concert?.location}</p>
                                    </Col>
                                    <Col md={6}>
                                        <p className="fs-4">
                                            <strong>Onset:</strong> {concert?.onset?.format('DD/MM/YYYY HH:mm') || 'Loading...'}
                                        </p>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Row className="mb-4">
                            <Col>
                                <Card bg="primary" text="white" className="text-center" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                    <Card.Body>
                                        <Card.Title>Total Seats</Card.Title>
                                        <Card.Text>{totalSeats}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card bg="success" text="white" className="text-center" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                    <Card.Body>
                                        <Card.Title>Free Seats</Card.Title>
                                        <Card.Text>{totalSeats - totalOccupiedSeats}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card bg="secondary" text="white" className="text-center" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                    <Card.Body>
                                        <Card.Title>Occupied Seats</Card.Title>
                                        <Card.Text>{totalOccupiedSeats}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        <Card className="p-3" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                            <Card.Title className="fs-3 text-center">Available Seats</Card.Title>
                            <Card.Body>
                                <Row style={{overflow: "scroll"}}>
                                    <div style={{ width: "1000px" }}>
                                        {renderSeats(concert.rows, concert.columns)}
                                    </div>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Container>
                ) : (
                    <Container className="d-flex align-items-center justify-content-center vh-100">
                        <div className="text-center">
                            <h1 className="text-danger mb-4">{error}</h1>
                            <Link to="/">
                                <Button variant="primary" className="px-4 py-2 fs-5">
                                    Go Back
                                </Button>
                            </Link>
                        </div>
                    </Container>
                )
            )}
        </>
    );
};

export default ConcertDetail;
