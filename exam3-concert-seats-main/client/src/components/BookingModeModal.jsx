import { Button, Modal, Form, Card, Row, Col, Alert } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BookingModeModal({ showModalBook, setShowModalBook, selectedOption, setSelectedOption, quantity, setQuantity, freeSeats }) {
    const [hoveredOption, setHoveredOption] = useState(1);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleMouseOver = (optionId) => {
        setHoveredOption(optionId);
    };

    const handleMouseLeave = () => {
        setHoveredOption(0);
    };

    const handleOptionSelect = (option) => { //if the user clicks on the manual selection, the modal is closed directly
        setSelectedOption(option);
        if (option === 1) {
            setShowModalBook(false);
        }
    };

    const handleSubmitAutomaticSelection = () => {
        if (quantity <= 0) {
            setError("The number should be greater than 0.");
        } else if (quantity > freeSeats) {
            setError(
                "Number too large, the concert has only " +
                freeSeats +
                " free seats at the moment."
            );
        } else {
            setError("");
            setShowModalBook(false);
        }
    };

    return (
        <>
            <Modal
                show={showModalBook}
                onHide={() => {
                    navigate("/book");
                }}
            >
                <Modal.Header closeButton />
                <Modal.Body>
                    <Row>
                        {/* Card for manual seat selection */}
                        <Col>
                            <Card
                                style={{ borderRadius: "20px" }}
                                onMouseOver={() => handleMouseOver(1)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleOptionSelect(1)}
                                className={
                                    selectedOption === 1
                                        ? "bg-success text-light"
                                        : hoveredOption === 1
                                            ? "bg-secondary text-light"
                                            : ""
                                }
                            >
                                <Card.Body className="d-flex justify-content-center align-items-center">
                                    Choose your seats!
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card
                                style={{ borderRadius: "20px" }}
                                onMouseOver={() => handleMouseOver(2)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => setSelectedOption(2)}
                                className={
                                    selectedOption === 2
                                        ? "bg-success text-light"
                                        : hoveredOption === 2
                                            ? "bg-secondary text-light"
                                            : ""
                                }
                            >
                                <Card.Body className="d-flex justify-content-center align-items-center">
                                    Let us choose for you!
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    {/* Show form for quantity selection only for automatic seat selection */}
                    {selectedOption === 2 && (
                        <>
                            <hr />
                            {error && (
                                <Row>
                                    <Col>
                                        <Alert variant={"danger"}>{error}</Alert>
                                    </Col>
                                </Row>
                            )}
                            <Row>
                                <Form.Group controlId="integerSelector">
                                    <Form.Label>
                                        Please specify the number of seats required.
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="1"
                                        min="1"
                                        placeholder="Number of seats"
                                        onChange={(el) => {
                                            setQuantity(el.target.value);
                                        }}
                                        value={quantity}
                                    />
                                </Form.Group>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-danger"
                        style={{ borderRadius: "20px", padding: "5px 15px" }}
                        onClick={() => {
                            navigate("/book");
                        }}
                    >
                        Go back
                    </Button>
                    {selectedOption === 2 && (
                        <Button
                            variant="outline-success"
                            style={{ borderRadius: "20px", padding: "5px 15px" }}
                            onClick={handleSubmitAutomaticSelection}
                        >
                            View automatically assigned seats
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default BookingModeModal;
