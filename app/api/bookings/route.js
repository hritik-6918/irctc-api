import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

// Validation schema for booking
const bookingSchema = z.object({
  trainId: z.string().uuid("Invalid train ID"),
  source: z.string().min(2, "Source must be at least 2 characters"),
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  passengerName: z.string().min(2, "Passenger name must be at least 2 characters"),
  passengerAge: z.number().int().positive("Age must be a positive integer").optional(),
  passengerGender: z.enum(["Male", "Female", "Other"]).optional(),
})

export async function POST(req) {
  try {
    // Verify JWT token
    const tokenData = verifyToken(req)
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid or missing token",
        },
        { status: 401 },
      )
    }

    const body = await req.json()

    // Validate request body
    const validation = bookingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.errors,
        },
        { status: 400 },
      )
    }

    const { trainId, source, destination, passengerName, passengerAge, passengerGender } = validation.data

    // Check if train exists
    const trainResult = await db.query("SELECT * FROM trains WHERE id = $1", [trainId])

    if (trainResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Train not found",
        },
        { status: 404 },
      )
    }

    // Verify source and destination are valid stops for this train
    const stopsQuery = `
      WITH source_stops AS (
        SELECT train_id, stop_order
        FROM train_stops
        WHERE train_id = $1 AND LOWER(station_name) = LOWER($2)
      ),
      destination_stops AS (
        SELECT train_id, stop_order
        FROM train_stops
        WHERE train_id = $1 AND LOWER(station_name) = LOWER($3)
      )
      SELECT ss.stop_order as source_order, ds.stop_order as destination_order
      FROM source_stops ss, destination_stops ds
      WHERE ss.stop_order < ds.stop_order
    `

    const stopsResult = await db.query(stopsQuery, [trainId, source, destination])

    if (stopsResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid source or destination for this train",
        },
        { status: 400 },
      )
    }

    // Start a transaction to handle race conditions
    await db.query("BEGIN")

    try {
      // Lock the seats table for this train to prevent concurrent bookings
      await db.query("SELECT id FROM seats WHERE train_id = $1 FOR UPDATE", [trainId])

      // Find an available seat
      const availableSeatQuery = `
        SELECT id, seat_number
        FROM seats
        WHERE train_id = $1
        AND (
          is_booked = FALSE
          OR (
            is_booked = TRUE
            AND (
              -- Seat is booked but the booking doesn't overlap with requested segment
              (booked_from IS NOT NULL AND booked_to IS NOT NULL)
              AND (
                (LOWER(booked_to) < LOWER($2))    -- Booking ends before requested source
                OR (LOWER(booked_from) > LOWER($3)) -- Booking starts after requested destination
              )
            )
          )
        )
        LIMIT 1
        FOR UPDATE
      `

      const availableSeatResult = await db.query(availableSeatQuery, [trainId, source, destination])

      if (availableSeatResult.rows.length === 0) {
        await db.query("ROLLBACK")
        return NextResponse.json(
          {
            success: false,
            message: "No seats available for this route",
          },
          { status: 400 },
        )
      }

      const seat = availableSeatResult.rows[0]

      // Update seat as booked
      await db.query("UPDATE seats SET is_booked = TRUE, booked_from = $1, booked_to = $2 WHERE id = $3", [
        source,
        destination,
        seat.id,
      ])

      // Generate a unique PNR (10-digit number)
      const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString()

      // Create booking record
      const bookingResult = await db.query(
        `INSERT INTO bookings 
         (id, user_id, train_id, seat_id, source, destination, passenger_name, passenger_age, passenger_gender, pnr)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          uuidv4(),
          tokenData.userId,
          trainId,
          seat.id,
          source,
          destination,
          passengerName,
          passengerAge || null,
          passengerGender || null,
          pnr,
        ],
      )

      const booking = bookingResult.rows[0]

      // Get train name for response
      const trainName = trainResult.rows[0].name

      // Commit transaction
      await db.query("COMMIT")

      return NextResponse.json(
        {
          success: true,
          message: "Seat booked successfully",
          booking: {
            id: booking.id,
            trainName,
            source: booking.source,
            destination: booking.destination,
            seatNumber: seat.seat_number,
            passengerName: booking.passenger_name,
            bookingDate: booking.booking_date,
            pnr: booking.pnr,
          },
        },
        { status: 201 },
      )
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(req) {
  try {
    // Verify JWT token
    const tokenData = verifyToken(req)
    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid or missing token",
        },
        { status: 401 },
      )
    }

    // Get all bookings for the user
    const bookingsQuery = `
      SELECT b.id, b.source, b.destination, b.passenger_name, 
             b.passenger_age, b.passenger_gender, b.booking_date, b.pnr, b.status,
             t.name as train_name, s.seat_number
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      JOIN seats s ON b.seat_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC
    `

    const bookingsResult = await db.query(bookingsQuery, [tokenData.userId])

    return NextResponse.json(
      {
        success: true,
        bookings: bookingsResult.rows,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get bookings error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
