import { Card, Col, Row, Spinner, Container } from "react-bootstrap";
import { useEffect, useState } from 'react';
import API from "../API.jsx";
import ConcertList from "../components/ConcertList.jsx";
import ConcertNavbar from "../components/ConcertNavbar.jsx";


function ViewAllConcerts({ user, logout }) {
    let [concerts, setConcerts] = useState([]);
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        API.listConcerts().then((concerts) => {
            setConcerts(concerts);
            setShowLoader(false);
        });
    }, []);

    return (
        <>
            <ConcertNavbar logout={logout} user={user} />

            {showLoader ? (
                <div className="d-flex align-items-center justify-content-center">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="sr-only" />
                    </Spinner>
                </div>
            ) : (
                <>
                    <Container fluid className="px-4 mt-5">
                        <Row className="justify-content-center">
                            <Col lg={10} md={10} sm={12} xs={12}>
                                {user && (
                                    <Card className="mb-4 border-0">
                                    </Card>
                                )}
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col lg={10} md={10} sm={12} xs={12}>
                                <ConcertList concerts={concerts} link={"/concerts/"} />
                            </Col>
                        </Row>
                    </Container>
                </>
            )}
        </>
    );
};

export default ViewAllConcerts;
