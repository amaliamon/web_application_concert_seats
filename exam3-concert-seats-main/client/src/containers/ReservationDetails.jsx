import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Container, Row, Col, Card, Modal, Alert, Spinner, Button } from 'react-bootstrap';
import ConcertNavbar from "../components/ConcertNavbar.jsx";
import API from "../API.jsx";
import NotLogged from "../components/NotLogged.jsx";


function ReservationDetails({ logout, user }) {
    let [concert, setConcert] = useState({});
    const [error, setError] = useState("")
    const { reservation_id } = useParams();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showLoader, setShowLoader] = useState(true);
    const [showLoaderModal, setShowLoaderModal] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        API.listReservationSeats(reservation_id).then((reservation) => {
            setConcert(() => reservation);
            setShowLoader(false)
        }).catch((e) => {
            if (e.error) {
                setError(e.error);
            } else {
                if (e.errors && e.errors[0]) {
                    setError(e.errors[0].msg);
                }
            }
            setShowLoader(false)
        });
    }, []);


    const handleDeleteConcert = () => {
        setShowLoaderModal(true);
        API.deleteReservation(reservation_id).then(() => {
            setShowConfirmation(false);
            setShowLoaderModal(false)
            navigate("/reservations")
        }).catch((e) => {
            let error = JSON.parse(e.message);
            setError(error.error || (error.errors[0] && error.errors[0].msg));
        })
    };

    const renderSeats = (user, rows, columns) => {
        const seatRows = [];

        for (let row = 1; row <= rows; row++) {
            const seatColumns = [];
            for (let seat = 1; seat <= columns; seat++) {
                const seatNumber = `${row}${String.fromCharCode(64 + seat)}`;
                const isOccupied = concert.seats.includes(seatNumber);
                const isReserved = concert.reservation_seats.includes(seatNumber);

                let seatClassName = 'text-center';
                if (isReserved) {
                    seatClassName += ' bg-warning text-light';
                } else if (isOccupied) {
                    seatClassName += ' bg-danger text-light';
                } else {
                    seatClassName += ' bg-success text-light';
                }

                seatColumns.push(
                    <Col key={seatNumber} className="p-2" style={{ width: `${100 / columns}%`}}>
                        <Card className={seatClassName} style={{ height: '40px', width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Card.Body style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                                <Card.Title style={{ fontSize: '1.5rem', margin: 0 }}>
                                    {seatNumber}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            }

            // Push each row of seats as a Row component
            seatRows.push(
                <Row key={row} className="justify-content-center mb-2 w-100">
                    {seatColumns}
                </Row>
            );
        }

        return seatRows;
    };




    let totalSeats = (concert.rows && concert.columns) ? (concert.rows * concert.columns) : 0;
    let totalOccupiedSeats = concert.seats ? concert.seats.length : 0;
    let totalReservedSeats = concert.reservation_seats ? concert.reservation_seats.length : 0;
    return (
        <>
            <ConcertNavbar logout={logout} user={user} />
            {user ? <>
                {showLoader ? <>
                    <div className="d-flex align-items-center justify-content-center vh-100">
                        <Spinner animation="border" variant="primary" role="status">
                            <span className="sr-only" />
                        </Spinner>
                    </div>
                </> : <>{
                    !error ? <>
                        <Container>
                            <br />
                            <Card style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                <Card.Body>
                                    <Card.Title className={"fs-2"}>
                                        <Button variant="outline-dark" onClick={() => {
                                            navigate("/reservations")

                                        }} style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                            <FaArrowLeft />
                                        </Button>&nbsp;&nbsp;
                                        {concert?.name}</Card.Title>
                                    <Row>
                                        <Col>
                                            <p className={"fs-4"}><strong>Location:</strong> {concert?.location}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p className={"fs-4"}>
                                                <strong>Onset:</strong> {concert?.onset?.format('DD/MM/YYYY HH:mm') || 'Loading...'}
                                            </p>
                                        </Col>
                                        <Col>
                                            <div className="text-end">
                                                <Button variant="danger" onClick={(e) => {
                                                    e.stopPropagation()
                                                    setShowConfirmation(true)
                                                }} style={{ borderRadius: "20px", padding: "5px 15px" }} >Delete Reservation</Button>
                                            </div>
                                        </Col>
                                    </Row><br />
                                    <Row>
                                        <Col>
                                            <Card className="text-center" bg="primary" text="white" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                                <Card.Body>
                                                    <Card.Title>Total seats</Card.Title>
                                                    <Card.Text>{totalSeats}</Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col>
                                            <Card className="text-center" bg="success" text="white" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                                <Card.Body>
                                                    <Card.Title>Free seats</Card.Title>
                                                    <Card.Text>{totalSeats - totalOccupiedSeats}</Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col>
                                            <Card className="text-center" bg="danger" text="white" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                                <Card.Body>
                                                    <Card.Title>Occupied seats</Card.Title>
                                                    <Card.Text>{totalOccupiedSeats}</Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col>
                                            <Card className="text-center" bg="warning" text="white" style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                                <Card.Body>
                                                    <Card.Title>Your seats</Card.Title>
                                                    <Card.Text>{totalReservedSeats}</Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Card style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                        <Card.Title className={"p-3 fs-3"}>Seats</Card.Title>
                                        <Card.Body style={{overflow: "scroll"}}>
                                            <div style={{width : "1000px"}}>
                                            {renderSeats(user, concert.rows, concert.columns)}
                                            </div>
                                        </Card.Body>
                                    </Card>


                                </Card.Body>
                            </Card>

                        </Container>
                    </> : <>
                        <Container className="d-flex align-items-center justify-content-center vh-100">
                            <Container className="text-center">
                                <h1 className="text-center"> {error} </h1>
                                <Link to={"/reservations"}>
                                    <Button className={"m-3"} size="lg" style={{ borderRadius: "20px", padding: "5px 15px" }}>Go to your reservations</Button>
                                </Link>
                            </Container>
                        </Container>
                    </>
                }</>}
            </> :
                <>
                    <NotLogged text={"Click on the login button to see all you reservations."} />
                </>}
            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Reservation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showLoaderModal ? <>
                        <div className="d-flex align-items-center justify-content-center">
                            <Spinner animation="border" variant="primary" role="status">
                                <span className="sr-only" />
                            </Spinner>
                        </div>
                    </> : <>
                        {error && <Row>
                            <Col>
                                <Alert variant={"danger"}>
                                    {error}
                                </Alert>
                            </Col>
                        </Row>}
                        <Row>
                            <Col>
                                <p>Are you sure you want to delete this reservation?</p>
                            </Col>
                        </Row>
                    </>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)} style={{ borderRadius: "20px", padding: "5px 15px" }}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteConcert} style={{ borderRadius: "20px", padding: "5px 15px" }}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReservationDetails;
