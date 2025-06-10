console.log("Setting up database tables...")

// Create users table
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`

// Create trains table
const createTrainsTable = `
CREATE TABLE IF NOT EXISTS trains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  total_seats INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`

// Create train_stops table
const createTrainStopsTable = `
CREATE TABLE IF NOT EXISTS train_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
  station_name VARCHAR(100) NOT NULL,
  distance_from_source INTEGER NOT NULL,
  stop_order INTEGER NOT NULL,
  UNIQUE(train_id, stop_order)
);
`

// Create seats table
const createSeatsTable = `
CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  train_id UUID NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  booked_from VARCHAR(100),
  booked_to VARCHAR(100),
  UNIQUE(train_id, seat_number)
);
`

// Create bookings table
const createBookingsTable = `
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  train_id UUID NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  source VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  passenger_name VARCHAR(100) NOT NULL,
  passenger_age INTEGER,
  passenger_gender VARCHAR(10),
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pnr VARCHAR(10) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'Confirmed'
);
`

// Create indexes for performance
const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_trains_source_destination ON trains(source, destination);
CREATE INDEX IF NOT EXISTS idx_seats_train_id ON seats(train_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_train_id ON bookings(train_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pnr ON bookings(pnr);
`

// Execute all SQL statements
console.log("Creating users table...")
console.log(createUsersTable)

console.log("Creating trains table...")
console.log(createTrainsTable)

console.log("Creating train_stops table...")
console.log(createTrainStopsTable)

console.log("Creating seats table...")
console.log(createSeatsTable)

console.log("Creating bookings table...")
console.log(createBookingsTable)

console.log("Creating indexes...")
console.log(createIndexes)

console.log("Database setup complete!")
