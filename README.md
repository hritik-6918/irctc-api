# IRCTC API - Railway Management System

A railway management system API similar to IRCTC, where users can check train availability, book seats, and manage bookings.

## Features

- User authentication (register, login)
- Admin operations (add trains, update seats)
- Check train availability between stations
- Real-time seat availability checking
- Secure seat booking with race condition handling
- Booking details retrieval

## Tech Stack

- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- API key for admin endpoints

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

\`\`\`
DATABASE_URL=postgresql://username:password@localhost:5432/irctc_db
JWT_SECRET=your_jwt_secret_key
ADMIN_API_KEY=your_admin_api_key
\`\`\`

## Setup Instructions

1. **Clone the repository**

\`\`\`bash
git clone https://github.com/yourusername/irctc-api.git
cd irctc-api
\`\`\`

2. **Install dependencies**

\`\`\`bash
npm install
\`\`\`

3. **Create PostgreSQL database**

\`\`\`bash
createdb irctc_db
\`\`\`

4. **Run database setup scripts**

\`\`\`bash
npm run setup-db
\`\`\`

5. **Seed initial data (optional)**

\`\`\`bash
npm run seed-db
\`\`\`

6. **Start the server**

\`\`\`bash
npm run dev
\`\`\`

The server will start on http://localhost:3000

## API Documentation

### Authentication Endpoints

#### Register a User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  \`\`\`

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  \`\`\`json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  \`\`\`
- **Response**: Returns JWT token for authentication

### Admin Endpoints

All admin endpoints require an API key in the header: `X-API-KEY: your_admin_api_key`

#### Add a New Train
- **URL**: `/api/admin/trains`
- **Method**: `POST`
- **Body**:
  \`\`\`json
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
  \`\`\`

#### Update Train Seats
- **URL**: `/api/admin/trains/:trainId/seats`
- **Method**: `PUT`
- **Body**:
  \`\`\`json
  {
    "totalSeats": 600
  }
  \`\`\`

### User Endpoints

#### Get Train Availability
- **URL**: `/api/trains?source=Delhi&destination=Mumbai`
- **Method**: `GET`

#### Book a Seat
- **URL**: `/api/bookings`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer your_jwt_token`
- **Body**:
  \`\`\`json
  {
    "trainId": "123e4567-e89b-12d3-a456-426614174000",
    "source": "Delhi",
    "destination": "Mumbai",
    "passengerName": "John Doe",
    "passengerAge": 30,
    "passengerGender": "Male"
  }
  \`\`\`

#### Get All Bookings
- **URL**: `/api/bookings`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your_jwt_token`

#### Get Specific Booking Details
- **URL**: `/api/bookings/:bookingId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer your_jwt_token`

## Testing

Run the test suite with:

\`\`\`bash
npm test
\`\`\`

## Race Condition Handling

The API handles race conditions during seat booking by:

1. Using database transactions to ensure atomicity
2. Implementing row-level locking with `FOR UPDATE` to prevent concurrent modifications
3. Validating seat availability within the transaction

## License

MIT
