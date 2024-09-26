import {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Card, Row, Col, Spinner, Container} from 'react-bootstrap';
import API from "../API.jsx";
import ConcertNavbar from "../components/ConcertNavbar.jsx";
import ConcertList from "../components/ConcertList.jsx";
import NotLogged from "../components/NotLogged.jsx";

function BookConcert ({user, logout}){
    let [concerts, setConcerts] = useState([]);
    const navigate = useNavigate();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        API.listNonBookedConcerts().then((concerts) => {
            setConcerts(concerts);
            setShowLoader(false)
        }).catch(() => navigate("/login"));
    }, []);

    return (
        <>
            <ConcertNavbar logout={logout} user={user}/>
            {user ? <>
                    {showLoader ? <>
                        <div className="d-flex align-items-center justify-content-center vh-100">
                            <Spinner animation="border" variant="primary" role="status">
                                <span className="sr-only"/>
                            </Spinner>
                        </div>
                    </> : <>
                        {concerts.length ? <>
                                <Row>
                                    <Col>
                                        {user && <Card className="border-0">
                                            <Card.Body>
                                                <Card.Title>Select a concert to book: </Card.Title>
                                            </Card.Body>
                                        </Card>}
                                    </Col>
                                </Row>
                                <ConcertList concerts={concerts} link={"/book/"}/>
                            </> :
                            <>
                                <Container className="d-flex align-items-center justify-content-center vh-100">
                                    <Container className="text-center">
                                        <h1>You have a reservation for every of our concerts, nothing to do here!</h1>
                                    </Container>
                                </Container>
                            </>
                        }
                    </>}
                </> :
                <>
                    <NotLogged text={"Click on the login button to book a concert."}/>
                </>
            }
        </>
    );
};

export default BookConcert;
