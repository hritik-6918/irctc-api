export default function ApiDocs() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Authentication Endpoints</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Register User</h3>
              <p className="mb-2">
                <span className="font-semibold">POST</span> /api/auth/register
              </p>
              <div className="bg-gray-100 p-3 rounded mb-2">
                <p className="font-semibold">Request Body:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}`}
                </pre>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "message": "User registered successfully",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Login User</h3>
              <p className="mb-2">
                <span className="font-semibold">POST</span> /api/auth/login
              </p>
              <div className="bg-gray-100 p-3 rounded mb-2">
                <p className="font-semibold">Request Body:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "email": "john@example.com",
  "password": "securepassword"
}`}
                </pre>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Admin Endpoints</h2>
          <p className="mb-4 text-red-600">
            All admin endpoints require an API key in the header: <code>X-API-KEY: your_api_key</code>
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Add New Train</h3>
              <p className="mb-2">
                <span className="font-semibold">POST</span> /api/admin/trains
              </p>
              <div className="bg-gray-100 p-3 rounded mb-2">
                <p className="font-semibold">Request Body:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "name": "Rajdhani Express",
  "source": "Delhi",
  "destination": "Mumbai",
  "totalSeats": 500,
  "stops": [
    {"name": "Kota", "distance": 300},
    {"name": "Surat", "distance": 700}
  ]
}`}
                </pre>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "message": "Train added successfully",
  "train": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Rajdhani Express",
    "source": "Delhi",
    "destination": "Mumbai",
    "totalSeats": 500
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Update Train Seats</h3>
              <p className="mb-2">
                <span className="font-semibold">PUT</span> /api/admin/trains/:trainId/seats
              </p>
              <div className="bg-gray-100 p-3 rounded mb-2">
                <p className="font-semibold">Request Body:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "totalSeats": 600
}`}
                </pre>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "message": "Train seats updated successfully",
  "train": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Rajdhani Express",
    "totalSeats": 600
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">User Endpoints</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Get Train Availability</h3>
              <p className="mb-2">
                <span className="font-semibold">GET</span> /api/trains?source=Delhi&destination=Mumbai
              </p>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "trains": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Rajdhani Express",
      "source": "Delhi",
      "destination": "Mumbai",
      "availableSeats": 423
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "name": "Duronto Express",
      "source": "Delhi",
      "destination": "Mumbai",
      "availableSeats": 312
    }
  ]
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Book a Seat</h3>
              <p className="mb-2">
                <span className="font-semibold">POST</span> /api/bookings
              </p>
              <p className="mb-2 text-red-600">
                Requires Authorization header: <code>Authorization: Bearer your_jwt_token</code>
              </p>
              <div className="bg-gray-100 p-3 rounded mb-2">
                <p className="font-semibold">Request Body:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "trainId": "123e4567-e89b-12d3-a456-426614174000",
  "source": "Delhi",
  "destination": "Mumbai",
  "passengerName": "John Doe",
  "passengerAge": 30,
  "passengerGender": "Male"
}`}
                </pre>
              </div>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "message": "Seat booked successfully",
  "booking": {
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "trainName": "Rajdhani Express",
    "source": "Delhi",
    "destination": "Mumbai",
    "seatNumber": "A12",
    "passengerName": "John Doe",
    "bookingDate": "2024-06-10T10:30:00Z",
    "pnr": "2457896541"
  }
}`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-2">Get Booking Details</h3>
              <p className="mb-2">
                <span className="font-semibold">GET</span> /api/bookings/:bookingId
              </p>
              <p className="mb-2 text-red-600">
                Requires Authorization header: <code>Authorization: Bearer your_jwt_token</code>
              </p>
              <div className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">Response:</p>
                <pre className="text-sm overflow-x-auto">
                  {`{
  "success": true,
  "booking": {
    "id": "323e4567-e89b-12d3-a456-426614174000",
    "trainName": "Rajdhani Express",
    "source": "Delhi",
    "destination": "Mumbai",
    "seatNumber": "A12",
    "passengerName": "John Doe",
    "passengerAge": 30,
    "passengerGender": "Male",
    "bookingDate": "2024-06-10T10:30:00Z",
    "pnr": "2457896541",
    "status": "Confirmed"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
