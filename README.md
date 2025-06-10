![screencapture-kzmii7selwtlv4i8kr4e-lite-vusercontent-net-2025-06-10-16_33_44](https://github.com/user-attachments/assets/56997030-31a1-43c6-a447-3c55680e5388)

# IRCTC API - Railway Management System

A railway management system API similar to IRCTC, where users can check train availability, book seats, and manage bookings.

---

## Features

* User authentication (register, login)
* Admin operations (add trains, update seats)
* Check train availability between stations
* Real-time seat availability checking
* Secure seat booking with race condition handling
* Booking details retrieval

---

## Tech Stack

* **Backend**: Node.js with Express.js
* **Database**: PostgreSQL
* **Authentication**: JWT
* **Security**: API key for admin endpoints

---

## Prerequisites

* Node.js (v14 or higher)
* PostgreSQL (v12 or higher)

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
ADMIN_API_KEY=your_admin_api_key
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/irctc-api.git
cd irctc-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create PostgreSQL Database

```bash
createdb irctc_db
```

### 4. Run Database Setup Scripts

```bash
npm run setup-db
```

### 5. Seed Initial Data (Optional)

```bash
npm run seed-db
```

### 6. Start the Server

```bash
npm run dev
```

The server will start at: `http://localhost:3000`

---

## API Documentation

### Authentication Endpoints

#### Register a User

* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login User

* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Body**:

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

* **Response**: JWT token for authentication

---

### Admin Endpoints

> **Note:** Requires API key in the header: `X-API-KEY: your_admin_api_key`

#### Add a New Train

* **URL**: `/api/admin/trains`
* **Method**: `POST`
* **Body**:

```json
{
  "name": "Rajdhani Express",
  "source": "Delhi",
  "destination": "Mumbai",
  "totalSeats": 500,
  "stops": [
    {"name": "Kota", "distance": 300},
    {"name": "Surat", "distance": 700}
  ]
}
```

#### Update Train Seats

* **URL**: `/api/admin/trains/:trainId/seats`
* **Method**: `PUT`
* **Body**:

```json
{
  "totalSeats": 600
}
```

---

### User Endpoints

#### Get Train Availability

* **URL**: `/api/trains?source=Delhi&destination=Mumbai`
* **Method**: `GET`

#### Book a Seat

* **URL**: `/api/bookings`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer your_jwt_token`
* **Body**:

```json
{
  "trainId": "123e4567-e89b-12d3-a456-426614174000",
  "source": "Delhi",
  "destination": "Mumbai",
  "passengerName": "John Doe",
  "passengerAge": 30,
  "passengerGender": "Male"
}
```

#### Get All Bookings

* **URL**: `/api/bookings`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer your_jwt_token`

#### Get Specific Booking Details

* **URL**: `/api/bookings/:bookingId`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer your_jwt_token`

---

## Testing

Run the test suite with:

```bash
npm test
```

---

## Race Condition Handling

To ensure consistent and secure seat booking, the API handles race conditions using:

1. **Database transactions** to ensure atomicity.
2. **Row-level locking** using `FOR UPDATE` to prevent concurrent updates.
3. **Seat validation within transactions** to avoid overbooking.
