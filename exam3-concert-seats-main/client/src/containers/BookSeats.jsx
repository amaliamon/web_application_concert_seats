import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import API from "../API.jsx";
import ConcertNavbar from "../components/ConcertNavbar.jsx";
import NotLogged from "../components/NotLogged.jsx";
import ModalReservation from "../components/BookingModeModal.jsx";
import { FaArrowLeft } from "react-icons/fa";

const BookSeats = ({ logout, user }) => {
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [concert, setConcert] = useState({});
    const { concert_id } = useParams();
    const [alert, setAlert] = useState({ show: false, color: "", text: "" });
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [dirtySeats, setDirtySeats] = useState(true);
    const [showModalBook, setShowModalBook] = useState(true);
    const [selectedOption, setSelectedOption] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showLoader, setShowLoader] = useState(true);
    const [disableSubmit, setDisableSubmit] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (dirtySeats) {
            API.listConcertSeats(concert_id)
                .then((concert) => {
                    setConcert(concert);
                    setDirtySeats(false);
                    setShowLoader(false);
                })
                .catch((e) => {
                    console.error("Error fetching concert seats:", e);
                    setError(e.error || (e.errors && e.errors[0] && e.errors[0].msg) || "An error occurred.");
                    setShowLoader(false);
                });
        }
    }, [dirtySeats]);

    useEffect(() => {
        if (!showModalBook && selectedOption === 2 && quantity > 0) {
            let tempSelectedSeats = [];
            for (let i = 0; i < quantity; i++) {
                let found = false;
                for (let j = 1; j <= concert.rows; j++) {
                    for (let k = 1; k <= concert.columns; k++) {
                        let seat = j + "" + String.fromCharCode(64 + k);
                        if (!concert.seats.includes(seat) && !tempSelectedSeats.includes(seat)) {
                            tempSelectedSeats.push(seat);
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }
            setSelectedSeats(tempSelectedSeats);
        }
    }, [showModalBook, selectedOption, quantity, concert]);

    const handleSeatSelection = (seat) => {
        setSelectedSeats((prevSeats) =>
            prevSeats.includes(seat)
                ? prevSeats.filter((s) => s !== seat)
                : [...prevSeats, seat]
        );
    };
    console.log(user);

    const onSubmit = async () => {
        setShowLoader(true);
        try {
            await API.createReservation(concert_id, selectedSeats);
            const authToken = await API.getAuthToken();
            console.log(user)
            const discount = await API.getDiscount(authToken, selectedSeats, user.loyal);

            setShowLoader(false);
            setDisableSubmit("disabled");
            setAlert({
                show: true,
                color: "success",
                text: `Reservation completed! Your discount is ${discount.discount}! Redirecting you to your reservations in 3 seconds...`,
            });
            setDirtySeats(true);
            setTimeout(() => {
                navigate("/reservations");
            }, 3000);
        } catch (err) {
            setShowLoader(false);
            console.error("Error creating reservation:", err);
            let error = JSON.parse(err.message);
            if (error.occupiedSeats) {
                setAlert({
                    show: true,
                    color: "danger",
                    text: `${error.error} Updating the state in 5 seconds...`,
                });
                setOccupiedSeats(error.occupiedSeats);
                setSelectedSeats((prevSeats) =>
                    prevSeats.filter((seat) => !error.occupiedSeats.includes(seat))
                );
                setTimeout(() => {
                    setOccupiedSeats([]);
                    setDirtySeats(true);
                    setAlert({ show: false, color: "", text: "" });
                }, 5000);
            } else {
                setAlert({
                    show: true,
                    color: "danger",
                    text: `${error.error} Redirecting to the booking page...`,
                });
                setDisableSubmit(true);
                setTimeout(() => {
                    navigate("/book");
                }, 2000);
            }
        }
    };

    const renderSeats = (user, rows, columns) => {
        const seatRows = [];

        for (let row = 1; row <= rows; row++) {
            const seatColumns = [];
            for (let seat = 1; seat <= columns; seat++) {
                const seatNumber = `${row}${String.fromCharCode(64 + seat)}`;
                const isOccupied = concert.seats.includes(seatNumber);
                const isSelected = user && selectedSeats.includes(seatNumber);
                const isAlreadyOccupied = user && occupiedSeats.includes(seatNumber);

                let seatClassName = 'text-center';
                if (isOccupied) {
                    seatClassName += ' bg-danger text-light';
                } else if (isSelected) {
                    seatClassName += ' bg-warning text-light';
                } else if (isAlreadyOccupied) {
                    seatClassName += ' bg-primary text-light';
                } else {
                    seatClassName += ' bg-success text-light';
                }
                const onClickFn = !isOccupied ? () => handleSeatSelection(seatNumber) : undefined;

                seatColumns.push(
                    <Col
                        key={seatNumber}
                        className="p-2"
                        onClick={onClickFn}
                        style={{ maxWidth: `${100 / columns}%` }}
                    >
                        <Card
                            className={seatClassName}
                            style={{ height: '40px', width: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: !isOccupied ? 'pointer' : 'default' }}
                        >
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
                <Row key={row} className="justify-content-center mb-2">
                    {seatColumns}
                </Row>
            );
        }

        return seatRows;
    };


    let totalSeats = (concert.rows && concert.columns) ? (concert.rows * concert.columns) : 0;
    let totalOccupiedSeats = concert.seats ? concert.seats.length : 0;
    let totalSelectedSeats = selectedSeats ? selectedSeats.length : 0;
    return (
        <>
            <ConcertNavbar logout={logout} user={user} />
            <Container>
                {user ? (
                    <>
                        {error ? (
                            <Container className="d-flex align-items-center justify-content-center vh-100">
                                <Container className="text-center">
                                    <h1>{error}</h1>
                                    <Link to={"/book"}>
                                        <Button className="m-3" size="lg">Go back</Button>
                                    </Link>
                                </Container>
                            </Container>
                        ) : (
                            <>
                                <br />
                                <Card style={{ borderRadius: "20px", padding: "5px 15px" }}>
                                    {showLoader ?
                                        <Card.Body>
                                            <div className="d-flex align-items-center justify-content-center vh-100">
                                                <Spinner animation="border" variant="primary" role="status">
                                                    <span className="sr-only" />
                                                </Spinner>
                                            </div>
                                        </Card.Body>
                                        :
                                        <Card.Body>
                                            <Card.Title className="fs-2">
                                                <Button
                                                    variant="outline-dark"
                                                    style={{ borderRadius: "20px", padding: "5px 15px" }}
                                                    onClick={() => navigate("/book")}
                                                >
                                                    <FaArrowLeft />
                                                </Button>
                                                &nbsp;&nbsp;
                                                {concert?.name}
                                            </Card.Title>
                                            <Card.Body className="fs-5">
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
                                                <br />
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
                                                                <Card.Title>Selected seats</Card.Title>
                                                                <Card.Text>{totalSelectedSeats}</Card.Text>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>
                                                <br />
                                                <Card>
                                                    <Card.Body>
                                                        <Card.Title className="fs-3">Seats</Card.Title>
                                                        <Row style={{overflow: "scroll"}}>
                                                            <div style={{width : "1000px"}}>
                                                                {renderSeats(user, concert.rows, concert.columns)}
                                                            </div>
                                                        </Row>
                                                        <br /><br /><br /><br /><br /><br />
                                                        <ModalReservation
                                                            showModalBook={showModalBook}
                                                            setShowModalBook={setShowModalBook}
                                                            selectedOption={selectedOption}
                                                            setSelectedOption={setSelectedOption}
                                                            quantity={quantity}
                                                            setQuantity={setQuantity}
                                                            freeSeats={totalSeats - totalOccupiedSeats}
                                                        />
                                                    </Card.Body>
                                                </Card>
                                            </Card.Body>
                                        </Card.Body>}
                                </Card>
                                {(selectedSeats.length > 0 || alert.show) && (
                                    <Row className="fixed-bottom">
                                        <Col>
                                            <footer className="bg-primary text-center p-2 rounded-top border border-primary border-3">
                                                {alert.show && (
                                                    <Row>
                                                        <Col>
                                                            <Alert variant={alert.color}>
                                                                {alert.text}
                                                            </Alert>
                                                        </Col>
                                                    </Row>
                                                )}
                                                <Row>
                                                    <Col>
                                                        <h3 className="text-light">
                                                            Selected seats: {selectedSeats.sort().map((el) => " " + el + " ")}
                                                        </h3>
                                                    </Col>
                                                    <Col xs="auto">
                                                        <Button
                                                            variant="danger"
                                                            className={disableSubmit}
                                                            style={{ borderRadius: "20px", padding: "5px 15px" }}
                                                            onClick={() => setSelectedSeats([])}
                                                            size="lg"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        &nbsp;&nbsp;&nbsp;
                                                        {selectedSeats.length > 0 && <Button
                                                            variant="success"
                                                            size="lg"
                                                            style={{ borderRadius: "20px", padding: "5px 15px" }}
                                                            className={disableSubmit}
                                                            onClick={onSubmit}
                                                        >
                                                            Book {selectedSeats.length} seats
                                                        </Button>}
                                                    </Col>
                                                </Row>
                                            </footer>
                                        </Col>
                                    </Row>
                                )}
                            </>
                        )}

                    </>
                ) : (
                    <NotLogged text={"Click on the login button, to book a concert!"} />
                )}
            </Container>
        </>
    );
};

export default BookSeats;
