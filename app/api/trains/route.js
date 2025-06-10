import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const source = searchParams.get("source")
    const destination = searchParams.get("destination")

    // Validate required parameters
    if (!source || !destination) {
      return NextResponse.json(
        {
          success: false,
          message: "Source and destination are required",
        },
        { status: 400 },
      )
    }

    // Find trains between source and destination
    // This query finds trains where:
    // 1. The source is either the train's source or one of its stops
    // 2. The destination is either the train's destination or one of its stops
    // 3. The source stop comes before the destination stop
    const trainsQuery = `
      WITH source_stops AS (
        SELECT train_id, stop_order
        FROM train_stops
        WHERE LOWER(station_name) = LOWER($1)
      ),
      destination_stops AS (
        SELECT train_id, stop_order
        FROM train_stops
        WHERE LOWER(station_name) = LOWER($2)
      )
      SELECT t.id, t.name, t.source, t.destination, t.total_seats,
             ss.stop_order as source_order,
             ds.stop_order as destination_order
      FROM trains t
      JOIN source_stops ss ON t.id = ss.train_id
      JOIN destination_stops ds ON t.id = ds.train_id
      WHERE ss.stop_order < ds.stop_order
    `

    const trainsResult = await db.query(trainsQuery, [source, destination])

    if (trainsResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No trains found for this route",
          trains: [],
        },
        { status: 200 },
      )
    }

    // For each train, calculate available seats between source and destination
    const trainsWithAvailability = await Promise.all(
      trainsResult.rows.map(async (train) => {
        // Count seats that are not booked or are booked for a segment that doesn't overlap with requested segment
        const availabilityQuery = `
        SELECT COUNT(*) as available_seats
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
      `

        const availabilityResult = await db.query(availabilityQuery, [train.id, source, destination])
        const availableSeats = Number.parseInt(availabilityResult.rows[0].available_seats)

        return {
          id: train.id,
          name: train.name,
          source: train.source,
          destination: train.destination,
          availableSeats,
        }
      }),
    )

    return NextResponse.json(
      {
        success: true,
        trains: trainsWithAvailability,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get trains error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
