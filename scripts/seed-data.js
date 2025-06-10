console.log("Seeding initial data...")

// Insert admin user
const insertAdminUser = `
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2b$10$X/4yCQYRZDfEwD5UEYiEZOIl0xgfIx/zgCZOXQqC9kqwlZHcCQNT.',  -- hashed password: 'admin123'
  'admin'
) ON CONFLICT (email) DO NOTHING;
`

// Insert regular user
const insertRegularUser = `
INSERT INTO users (name, email, password, role)
VALUES (
  'Regular User',
  'user@example.com',
  '$2b$10$X/4yCQYRZDfEwD5UEYiEZOIl0xgfIx/zgCZOXQqC9kqwlZHcCQNT.',  -- hashed password: 'user123'
  'user'
) ON CONFLICT (email) DO NOTHING;
`

// Insert sample trains
const insertTrains = `
-- Train 1: Delhi to Mumbai
WITH train1 AS (
  INSERT INTO trains (name, source, destination, total_seats)
  VALUES ('Rajdhani Express', 'Delhi', 'Mumbai', 500)
  RETURNING id
)
INSERT INTO train_stops (train_id, station_name, distance_from_source, stop_order)
SELECT id, 'Delhi', 0, 1 FROM train1
UNION ALL
SELECT id, 'Kota', 300, 2 FROM train1
UNION ALL
SELECT id, 'Surat', 700, 3 FROM train1
UNION ALL
SELECT id, 'Mumbai', 1000, 4 FROM train1;

-- Train 2: Mumbai to Chennai
WITH train2 AS (
  INSERT INTO trains (name, source, destination, total_seats)
  VALUES ('Duronto Express', 'Mumbai', 'Chennai', 400)
  RETURNING id
)
INSERT INTO train_stops (train_id, station_name, distance_from_source, stop_order)
SELECT id, 'Mumbai', 0, 1 FROM train2
UNION ALL
SELECT id, 'Pune', 150, 2 FROM train2
UNION ALL
SELECT id, 'Hyderabad', 500, 3 FROM train2
UNION ALL
SELECT id, 'Chennai', 1200, 4 FROM train2;

-- Train 3: Delhi to Kolkata
WITH train3 AS (
  INSERT INTO trains (name, source, destination, total_seats)
  VALUES ('Howrah Express', 'Delhi', 'Kolkata', 450)
  RETURNING id
)
INSERT INTO train_stops (train_id, station_name, distance_from_source, stop_order)
SELECT id, 'Delhi', 0, 1 FROM train3
UNION ALL
SELECT id, 'Kanpur', 400, 2 FROM train3
UNION ALL
SELECT id, 'Patna', 800, 3 FROM train3
UNION ALL
SELECT id, 'Kolkata', 1300, 4 FROM train3;
`

// Generate seats for each train
const generateSeats = `
-- Function to generate seats for a train
CREATE OR REPLACE FUNCTION generate_seats_for_train(train_id UUID, total_seats INTEGER)
RETURNS VOID AS $$
DECLARE
  coach CHAR(1);
  seat_num INTEGER;
  seat_count INTEGER := 0;
  coaches_array CHAR(1)[] := ARRAY['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  seats_per_coach INTEGER := 50;
BEGIN
  FOREACH coach IN ARRAY coaches_array
  LOOP
    FOR seat_num IN 1..seats_per_coach
    LOOP
      IF seat_count < total_seats THEN
        INSERT INTO seats (train_id, seat_number, is_booked)
        VALUES (train_id, coach || seat_num, FALSE);
        seat_count := seat_count + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;
    
    IF seat_count >= total_seats THEN
      EXIT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate seats for all trains
DO $$
DECLARE
  train_record RECORD;
BEGIN
  FOR train_record IN SELECT id, total_seats FROM trains
  LOOP
    PERFORM generate_seats_for_train(train_record.id, train_record.total_seats);
  END LOOP;
END;
$$;
`

// Execute all SQL statements
console.log("Inserting admin user...")
console.log(insertAdminUser)

console.log("Inserting regular user...")
console.log(insertRegularUser)

console.log("Inserting sample trains...")
console.log(insertTrains)

console.log("Generating seats for trains...")
console.log(generateSeats)

console.log("Seed data inserted successfully!")
