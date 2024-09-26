import dayjs from "dayjs";

const SERVER1 = 'http://localhost:3001/api';
const SERVER2 = 'http://localhost:3002/api';


async function listConcerts() {
  const response = await fetch(`${SERVER1}/concerts`);
  const concerts = await response.json();
  if (response.ok) {
    return concerts.map(e => ({
      concert_id: e.concert_id,
      theater_id: e.theater_id,
      name: e.name,
      location: e.location,
      onset: dayjs(e.onset),
      booked_seats: e.booked_seats,
      total_seats: e.total_seats,
      image: e.image,
    }));
  } else {
    throw concerts;
  }
}

async function listNonBookedConcerts() {
  const response = await fetch(`${SERVER1}/concerts/non-booked`, {
    credentials: 'include',
  });
  const concerts = await response.json();
  if (response.ok) {
    return concerts.map(e => ({
      concert_id: e.concert_id,
      theater_id: e.theater_id,
      name: e.name,
      location: e.location,
      onset: dayjs(e.onset),
      booked_seats: e.booked_seats,
      total_seats: e.total_seats,
      image: e.image,
    }));
  } else {
    throw concerts;
  }
}


async function listReservations() {
  const response = await fetch(`${SERVER1}/reservations`, {
    credentials: 'include',
  });
  const reservations = await response.json();
  if (response.ok) {
    return reservations.map(e => ({
      reservation_id: e.reservation_id,
      concert_id: e.concert_id,
      theater_id: e.theater_id,
      name: e.name,
      location: e.location,
      onset: dayjs(e.onset),
      booked_seats: e.booked_seats,
      total_seats: e.total_seats,
      image: e.image,
    }));
  } else {
    throw reservations;
  }
}

/**
 * Fetch details and seats for a specific concert by its ID.
 */
async function listConcertSeats(concert_id) {
  const response = await fetch(`${SERVER1}/concerts/${concert_id}`, {
    credentials: 'include'
  });
  const concert = await response.json();
  if (response.ok) {
    return {
      ...concert,
      onset: dayjs(concert.onset),
    };
  } else {
    throw concert;
  }
}

/**
 * Delete a reservation by its ID.
 */
async function deleteReservation(reservation_id) {
  console.log(reservation_id)
  const response = await fetch(`${SERVER1}/reservations/${reservation_id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (response.ok) {
    return await response.json();
  } else {
    const message = await response.text();
    throw new Error(message);
  }
}

/**
 * Fetch the seats for a specific reservation by its ID.
 */
async function listReservationSeats(reservation_id) {
  const response = await fetch(`${SERVER1}/reservations/${reservation_id}`, {
    credentials: 'include',
  });
  const reservation = await response.json();
  if (response.ok) {
    return {
      ...reservation,
      onset: dayjs(reservation.onset),
    };
  } else {
    throw reservation;
  }
}

/**
 * Log in a user with given credentials.
 */
async function logIn(credentials) {
  const response = await fetch(`${SERVER1}/session`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw new Error(errDetail.message);
  }
}

/**
 * Log out the current user.
 */
async function logOut() {
  await fetch(`${SERVER1}/session/current`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Get information about the currently logged-in user.
 */
async function getUserInfo() {
  const response = await fetch(`${SERVER1}/session/current`, {
    credentials: 'include',
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;
  }
}

async function getAuthToken() {
  try {
    const response = await fetch(`${SERVER1}/auth-token`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorDetail = await response.json();
      throw new Error(errorDetail.message || "Failed to get auth token");
    }

    const { token } = await response.json();  // Assuming the server returns an object with a 'token' field
    return token;  // Return the token

  } catch (error) {
    console.error("Error fetching auth token:", error);
    throw error;  // Re-throw the error for further handling
  }
}

/**
 * Create a new reservation for a specific concert.
 */
async function createReservation(concert_id, seats) {
  const response = await fetch(`${SERVER1}/reservations/${concert_id}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ seats }),
  });
  if (response.ok) {
    return await response.json();
  } else {
    const message = await response.text();
    throw new Error(message);
  }
}

const getDiscount = async (authToken, booked_seats, loyal) => {
  console.log({booked_seats});
  const payload = JSON.stringify({ booked_seats });
  const response = await fetch(`${SERVER2}/discount/`+ (loyal ? "loyal" : "non-loyal"), {
    method: 'POST',  // Use POST method
    headers: {
      'Authorization': `Bearer ${authToken}`,  // Include the authorization token
      'Content-Type': 'application/json',  // Specify content type
    },
    body: payload,  // Send the payload
    credentials: 'include',  // Include credentials if needed
  });

  // Check if the response is ok
  if (!response.ok) {
    // Extract error details if response is not ok
    console.log({booked_seats});
    const errorDetail = await response.json();
    throw new Error(errorDetail.message || "Failed to get discount");
  }

  // Parse and return the response JSON if successful
  const discount = await response.json();
  return discount;
};


const API = {
  logIn,
  logOut,
  getUserInfo,
  listConcerts,
  listConcertSeats,
  deleteReservation,
  listNonBookedConcerts,
  listReservations,
  createReservation,
  listReservationSeats, 
  getAuthToken, 
  getDiscount
};

export default API;
