import { Alert, Card, Col, Modal, Row, Spinner, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../API';

function ConcertList({ concerts, link, setDirty = () => {}, isReservations = false }) {
    const [hoveredConcert, setHoveredConcert] = useState(null);
    const [currentReservation, setCurrentReservation] = useState({});
    const [error, setError] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!showConfirmation) setError("");
    }, [showConfirmation]);

    const handleMouseOver = (concertId) => setHoveredConcert(concertId);
    const handleMouseLeave = () => setHoveredConcert(null);

    const handleDeleteConcert = () => {
        if (!currentReservation) {
            setError("Invalid reservation. Please try again.");
            return;
        }
        setShowLoaderModal(true);

        API.deleteReservation(currentReservation)
            .then(() => {
                setShowConfirmation(false);
                setShowLoaderModal(false);
                setDirty(true);
            })
            .catch((e) => {
                let errorMsg = JSON.parse(e.message);
                setError(errorMsg.error || (errorMsg.errors[0] && errorMsg.errors[0].msg));
                setShowLoaderModal(false);
            });
    };

    const renderConcertCard = (concert) => {
    const availableSeats = concert.total_seats - concert.booked_seats;

        return (
            <Col lg={3} md={5} className="d-flex" key={concert.concert_id}>
                <Card
                    onClick={() => navigate(link + (isReservations ? concert.reservation_id : concert.concert_id))}
                    onMouseOver={() => handleMouseOver(concert.concert_id)}
                    onMouseLeave={handleMouseLeave}
                    className={`shadow ${hoveredConcert === concert.concert_id ? 'hovered-card' : ''}`}
                    style={{
                        height: '100%',
                        borderRadius: '10px',
                        transition: 'transform 0.3s ease-in-out',
                        transform: hoveredConcert === concert.concert_id ? 'scale(1.05)' : 'scale(1)',
                        padding: '10px'
                    }}
                >
                    <Card.Img
                        variant="top"
                        src={concert.image}
                        style={{ height: '400px', objectFit: 'cover', borderRadius: '10px' }}
                    />
                    <Card.Body>
                        <Row>
                            <Col>
                                <h5 className="text-truncate">{concert.name}</h5>
                                <p className="text-truncate">{concert.location}</p>
                                <p>{concert.onset.format('DD/MM/YYYY HH:mm')}</p>
                            </Col>
                            <Col>
                                <p className="text-end">Available: {availableSeats}</p>
                                <p className="text-end">Booked: {concert.booked_seats}</p>
                                <p className="text-end">Total: {concert.total_seats}</p>
                            </Col>
                        </Row>
                        {concert.reservation_id && (
                            <div className="text-end">
                                <Button
                                    variant="danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentReservation(concert.reservation_id);
                                        setShowConfirmation(true);
                                    }}
                                >
                                    Delete Reservation
                                </Button>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        );
    };

    return (
        <>
            <Container fluid className="py-4 d-flex justify-content-center align-items-center">
                {concerts && concerts.length === 0 ? (
                    <h1 className="text-center">No concerts to show</h1>
                ) : (
                    <Row className="g-4 justify-content-center w-100">
                        {concerts.map(renderConcertCard)}
                    </Row>
                )}
            </Container>

            {/* Confirmation Modal */}
            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showLoaderModal ? (
                        <div className="d-flex align-items-center justify-content-center">
                            <Spinner animation="border" variant="primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <Row>
                                    <Col>
                                        <Alert variant="danger">{error}</Alert>
                                    </Col>
                                </Row>
                            )}
                            <Row>
                                <Col>
                                    <p>Are you sure you want to delete this reservation?</p>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConcert} disabled={showLoaderModal}>
                        {showLoaderModal ? <><Spinner size="sm" animation="border" /> Deleting...</> : "Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ConcertList;
