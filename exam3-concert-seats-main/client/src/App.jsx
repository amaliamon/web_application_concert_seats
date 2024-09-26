import {useEffect, useState} from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from "./API.jsx";
import ViewAllConcerts from "./containers/viewAllConcerts.jsx";
import LoginForm from './containers/LoginForm.jsx';
import BookConcert from './containers/BookConcert.jsx';
import MyReservations from './containers/MyReservations.jsx'
import DefaultRoute from './containers/DefaultRoute.jsx';
import ConcertDetail from './containers/ConcertDetails.jsx';
import ReservationDetails from './containers/ReservationDetails.jsx';
import BookSeats from './containers/BookSeats.jsx';



function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // here you have the user info, if already logged in
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
            } catch (err) {
                // NO need to do anything: user is simply not yet authenticated
                //handleError(err);
            }
        };
        checkAuth();
    }, []);

    const doLogOut = async () => {
        await API.logOut();
        setLoggedIn(false);
        setUser(undefined);
    }

    const loginSuccessful = (user) => {
        setUser(user);
        setLoggedIn(true);
    }
    const renewToken = () => {
        API.getAuthToken().then((resp) => { setAuthToken(resp.token); } )
        .catch(err => {console.log("DEBUG: renewToken err: ",err)});
      }

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/*' element={<DefaultRoute logout={doLogOut} user={user}/>}/>
                <Route path='/' element={<Navigate replace to='/concerts'/>}/>
                <Route path='/concerts' element={<ViewAllConcerts logout={doLogOut} user={user}/>}/>
                <Route path='/concerts/:concert_id' element={<ConcertDetail logout={doLogOut} user={user}/>}/>
                <Route path='/book/:concert_id' element={<BookSeats logout={doLogOut} user={user}/>}/>
                <Route path='/book' element={<BookConcert logout={doLogOut} user={user}/>}/>
                <Route path='/reservations' element={<MyReservations logout={doLogOut} user={user}/>}/>
                <Route path='/reservations/:reservation_id' element={<ReservationDetails logout={doLogOut} user={user}/>}/>
                <Route path='/login' element={loggedIn ? <Navigate replace to='/concerts'/> :
                    <LoginForm loginSuccessful={loginSuccessful} logout={doLogOut} user={user}/>}/>
                
               
            </Routes>
            
        </BrowserRouter>
    )
}

export default App
