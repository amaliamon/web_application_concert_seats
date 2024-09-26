import {useEffect, useState} from 'react';
import ConcertNavbar from '../components/ConcertNavbar.jsx';
import API from "../API.jsx";
import ConcertList from "../components/ConcertList.jsx";
import NotLogged from "../components/NotLogged.jsx";
import {Link, useNavigate} from "react-router-dom";
import {Card, Col, Row, Spinner} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

const Reservations = ({user, logout}) => {
    let [concerts, setConcerts] = useState([]);
    const [dirty, setDirty] = useState(true);
    const [showLoader, setShowLoader] = useState(true)

    useEffect(() => {
        if (dirty) {
            API.listReservations().then((concerts) => {
                setConcerts(concerts);
                setShowLoader(false)
            }).catch();
            setDirty(false)
        }
    }, [dirty]);

    return (
        <>
            <ConcertNavbar logout={logout} user={user}/>
            {user ? <>
                    {showLoader ?
                        <div className="d-flex align-items-center justify-content-center vh-100">
                            <Spinner animation="border" variant="primary" role="status">
                                <span className="sr-only"/>
                            </Spinner>
                        </div>
                        : <>
                            {concerts.length ? <>
                                    <Row>
                                        <Col>
                                            <Card>
                                                <Card.Body>
                                                    <Card.Title>Your reservations: </Card.Title>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <ConcertList concerts={concerts} link={"/reservations/"} isReservations={true}
                                                setDirty={setDirty}/>
                                </> :
                                <>
                                    <Container className="d-flex align-items-center justify-content-center vh-100">
                                        <Container className="text-center">
                                            <h1>You don't have any reservation yet, fix this!</h1>
                                            <Link to="/book">
                                                <Button size="lg">Book your first concert!</Button>
                                            </Link>
                                        </Container>
                                    </Container>
                                </>}
                        </>}
                </> :
                <>
                    <NotLogged text={"Click on the login button to see all your reservations."}/>
                </>
            }
        </>
    );
};

export default Reservations;
