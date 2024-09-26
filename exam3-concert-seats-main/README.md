[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/XYY1fduM)
# Exam #3: "Concert Seats"
## Student: MONTEMURRO AMALIA VITTORIA

## React Client Application Routes

- Route `/login`: Allows users to authenticate.
- Route `/concerts`: Displays a list of all available concerts to both authenticated and non-authenticated users.
- Route `/concerts/:concert_id`:  Provides information about a specific concert, including total seats, and free seats, to all users. No operations are allowed on this route.
- Route `/book`:  Shows a list of bookable concerts to authenticated users, excluding concerts that the user has already reserved.
- Route `/book/:concert_id`:  Allows authenticated users to make a reservation for a specific concert identified by concert_id. Displays information about the concert, including occupied and free seats.
- Route `/reservations`: Displays a list of reservations made by the authenticated user and allows them to cancel their reservations.
- Route `/reservations/:reservation_id`:  Shows details of a specific reservation identified by reservation_id to authenticated user. Includes a list of chosen occupied seats and available free seats, and allows the cancellation of the reservation.

## API Server

- GET `/api/concerts`
  - Request parameters: none.
  - Authentication: not required.
  - It retrieves a list of all available concerts. 
  - Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  - Response body:
    ``` 
      [{
          "concert_id": 1,
    "theater_id": 1,
    "name": "Pink Floyd Legend - The Dark Side of the Moon",
    "location": "Sanremo",
    "onset": "2024-11-24 21:00:00",
    "booked_seats": 2,
    "total_seats": 32,
    "image": "https://www.ciaotickets.com/sites/default/files/styles/img_main_quadrato/public/immagini_evento_quadrata/pink%20floyd%20legend%201080%20%281%29.jpg?itok=0-J-3mTk"
      }]

- GET `/api/concerts/non-booked`
  - Request parameters: id of the authenticated user.
  - Authentication: required.
  - It retrieves a list of all available concerts that have not been booked by the authenticated user. 
  - Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  - Response body:
    ``` 
      [ {
    "concert_id": 3,
    "theater_id": 3,
    "name": "Giovanni Allevi - Piano Solo Tour",
    "location": "Assisi",
    "onset": "2024-11-15 21:00:00",
    "total_seats": 126,
    "image": "https://www.mondomilano.it/wp-content/uploads/2024/02/Ciovanni-Allevi-concerti-2024-Date-info-tour-biglietti-Piano-Solo-Tour-2024.webp",
    "booked_seats": 2
      } ]

- GET `/api/concerts/:concert_id`
  - Request parameters:
      - `concert_id`:  The unique identifier of the concert to be visualized.
  - Authentication: not required.
  - It retrieves information for a specific concert identified by concert_id.
  - Response: `200 OK` (success), `422 unprocessable entity` (wrong concert_id) or `500 Internal Server Error` (generic error).
  - Response body:
    ``` 
      {
        "concert_id": 1,
        "theater_id": 1,
        "name": "Pink Floyd Legend - The Dark Side of the Moon",
        "location": "Sanremo",
        "onset": "2024-11-24 21:00:00",
        "rows": 4,
        "columns": 8,
        "seats": [
          "1A",
          "1B"
        ]
      }
- GET `/api/reservations`
  - Request parameters: not required;
  - Authentication: required;
  - It retrieves a list of all reservations made by the authenticated user.
  - Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  - Response body:
    ``` 
          {
        "reservation_id": 1,
    "concert_id": 1,
    "theater_id": 1,
    "name": "Pink Floyd Legend - The Dark Side of the Moon",
    "location": "Sanremo",
    "onset": "2024-11-24 21:00:00",
    "total_seats": 32,
    "image": "https://www.ciaotickets.com/sites/default/files/styles/img_main_quadrato/public/immagini_evento_quadrata/pink%20floyd%20legend%201080%20%281%29.jpg?itok=0-J-3mTk",
    "booked_seats": 2
        
      }
- GET `/api/reservations/:reservation_id`
  - Request parameters: 
    - `reservation_id`: unique identifier of the reservation. 
  - Authentication: required.
  - It retrieves detailed information about a specific concert reservation identified by reservation_id.
  - Response: `200 OK` (success), `422 unprocessable entity` (wrong reservation_id) , `403 Forbidden` (If the authenticated user attempts to access a reservation they did not make) o `500 Internal Server Error` (generic error).
  - Response body:
  ``` 
  {
    "concert_id": 1,
    "theater_id": 1,
    "name": "Pink Floyd Legend - The Dark Side of the Moon",
    "location": "Sanremo",
    "onset": "2024-11-24 21:00:00",
    "rows": 4,
    "columns": 8,
    "seat": "1A",
    "uid": 1,
    "seats": [
      "1A",
      "1B"
    ],
    "reservation_seats": [
      "1A",
      "1B"
    ]
  }



- POST `/api/reservations/:concert_id`
  - Request parameters:
    - `concert_id`: the unique identifier of the concert for which the reservation is being made.
    - Request body:
    ``` 
      {
        "seats": [
          "1A",
          "1B",
        ]
      }
  - Authentication: required.
  - Creates a new reservation for the authenticated user for the specified concert. The request must include a list of seats to be booked. The server checks the validity of the concert and seat availability before creating the reservation.
  - Response: `200 OK` (success), `422 unprocessable entity` (wrong concert_id or seats), `400 Bad request` (The user has already made a reservation for the specified concert or one or more of the requested seats are already occupied) or `500 Internal Server Error` (generic error).

- DELETE `/api/reservations/:reservation_id`
  - Request parameters:
    - `reservation_id`: the unique identifier of the reservstion to delete.
  - Authentication: required.
  - Deletes a specific reservation identified by reservation_id, thereby releasing the reserved seats. The reservation can only be deleted by the user who made it. 
  - Response: `200 OK` (success), `422 unprocessable entity` (the reservation_id is invalid or does not correspond to an existing reservation.) , `403 Forbidden` (the user is attempting to delete a reservation that does not belong to them) o `500 Internal Server Error` (generic error).
  - Response body:
  ```
    - {
        "numRowChanges": 1
      }
- GET /api/auth-token: 
  - Returns an auth token with authentication level(authenticated)
  - Response body:
  ```
    - {
        token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjY0Mjk1MzQsImV4cCI6MTcyNjQyOTgzNH0.h28WRy9onfWFqdYUoL-Bsov7EMrAQajylh45VQYFKNE
      }

## Authentication API



- POST `/api/sessions`
  - Request parameters: none
  - Request body:
    ```
    {
      "username": "enrico@test.com",
      "password": "pwd"
    }

  - It creates a new session with the credential sent.

  - Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  - Response body:
  ``` 
  {
  "id": 1,
  "username": "enrico@test.com",
  "loyal": true
  }

- GET `/api/sessions/current`
  - Request parameters: none
  - Request body: none
  - It verifies that the session is still valid and the information of the logged user.
  - Response: `201 Created` (success) or `401 Unauthorized` (error).

  - Response body:
    ```
    {
      "uid": 1,
      "username": "enrico@test.com"
    }

- DELETE `/api/sessions/current`
  - Request parameters: none
  - Request body: none
  - It deletes the current session. It has to provide a valid session id. 
  - Response: `200 OK` (success) or `500 Internal Server Error` (generic error).
  - Response body: none


## API Server2

- POST `/api/discount/:loyal`
  - Request parameters: booked_seats, representing the seats occupied by the user.
  - It calculates a discount percentage based on the number of occupied seats and whether the user is a loyal customer. 
  - Response: `200 OK` (success) or `400 Bad Request`.
  ``` 

## Database Tables

- Table `users` - contains (uid, email, username, salt, password, loyal)
- Table `theaters` - contains (theater_id, dimension, rows, columns)
- Table `concerts` - contains (concert_id, name, location, onset, theater_id, image)
- Table `reservations` - contains (reservation_id, uid, concert_id)
- Table `reservation_seats` - contains (rsid, reservation_id, seat)

## Main React Components

- Components
  - `ConcertList` (in `ConcertList.jsx`): This component is used to display a list of all available concerts. It is a reusable component that renders the concert list in various parts of the web application. 
  - `BookingModeModal` (in `BookingModeModal.jsx`): This modal allows users to choose the booking mode, either automatic (random seat selection) or manual (where the user selects seats directly).
  - `ConcertNavbar` (in `ConcertNavbar.jsx`): This component renders the navigation bar for the concert-related pages.
  - `NotLogged` (in `NotLogged.jsx`): This component is displayed when a page requires authentication, informing the user that they need to log in to access the page.
- Containers
  - `ViewAllConcerts` (in `ViewAllConcerts.jsx`): This component is displayed on the main page, which is accessible without authentication. It renders all concerts available in the database.
  - `BookConcert` (in `BookConcert.jsx`): This component shows concerts that are available for booking by authenticated users, excluding concerts that the user has already booked.
  - `MyReservations` (in `MyReservations.jsx`): This component displays all the concerts the user has already booked and provides the option to cancel a reservation.
  - `ConcertDetails` (in `ConcertDetails.jsx`): This component shows detailed information about a selected concert, including both occupied and available seats. It is accessible to both authenticated and unauthenticated users.
  - `BookSeats` (in `BookSeats.jsx`): This component displays the seating arrangement for a concert, showing both occupied and available seats. It allows users to reserve one or more seats.
  - `ReservationDetails` (in `ReservationDetails.jsx`): This component shows details about a specific reservation, including the seats that have been booked. It also allows the user to cancel the reservation.
  - `DefaultRoute` (in `DefaultRoute.jsx`): This component renders a 404 error page when the user navigates to an undefined route.
  - `LoginForm` (in `LoginForm.jsx`): This component renders the login form, allowing users to authenticate themselves.

## Screenshot

![Screenshot](./img/mainPage.png)
![Screenshot](./img/login.png)
![Screenshot](./img/reservations.png)
![Screenshot](./img/bookingPage.png)
![Screenshot](./img/seatSelection.png)
![Screenshot](./img/seatSelected.png)

## Users Credentials

- enrico@test.com, pwd (loyal user)
- luigi@test.com, pwd (loyal user)
- alice@test.com, pwd (loyal)
- harry@test.com, pwd

