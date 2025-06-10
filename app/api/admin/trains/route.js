import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyApiKey } from "@/lib/auth"
import { z } from "zod"

// Validation schema for train creation
const trainSchema = z.object({
  name: z.string().min(2, "Train name must be at least 2 characters"),
  source: z.string().min(2, "Source must be at least 2 characters"),
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  totalSeats: z.number().int().positive("Total seats must be a positive integer"),
  stops: z
    .array(
      z.object({
        name: z.string().min(2, "Stop name must be at least 2 characters"),
        distance: z.number().int().nonnegative("Distance must be a non-negative integer"),
      }),
    )
    .optional(),
})

export async function POST(req) {
  try {
    // Verify API key
    const apiKeyValid = verifyApiKey(req)
    if (!apiKeyValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Invalid API key",
        },
        { status: 401 },
      )
    }

    const body = await req.json()

    // Validate request body
    const validation = trainSchema.safeParse(body)
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

    const { name, source, destination, totalSeats, stops } = validation.data

    // Start a transaction
    await db.query("BEGIN")

    try {
      // Insert train
      const trainResult = await db.query(
        "INSERT INTO trains (name, source, destination, total_seats) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, source, destination, totalSeats],
      )

      const train = trainResult.rows[0]

      // Add source and destination as stops if not provided
      const processedStops = stops || []

      // Ensure source is the first stop
      if (!processedStops.some((stop) => stop.name === source)) {
        processedStops.unshift({ name: source, distance: 0 })
      }

      // Ensure destination is the last stop
      if (!processedStops.some((stop) => stop.name === destination)) {
        // Find the maximum distance from existing stops
        const maxDistance = processedStops.reduce((max, stop) => Math.max(max, stop.distance), 0)

        // Add destination with a distance greater than any existing stop
        processedStops.push({
          name: destination,
          distance: maxDistance + 100, // Arbitrary distance increment
        })
      }

      // Sort stops by distance
      processedStops.sort((a, b) => a.distance - b.distance)

      // Insert stops
      for (let i = 0; i < processedStops.length; i++) {
        const stop = processedStops[i]
        await db.query(
          "INSERT INTO train_stops (train_id, station_name, distance_from_source, stop_order) VALUES ($1, $2, $3, $4)",
          [train.id, stop.name, stop.distance, i + 1],
        )
      }

      // Generate seats for the train
      await db.query("SELECT generate_seats_for_train($1, $2)", [train.id, totalSeats])

      // Commit transaction
      await db.query("COMMIT")

      return NextResponse.json(
        {
          success: true,
          message: "Train added successfully",
          train: {
            id: train.id,
            name: train.name,
            source: train.source,
            destination: train.destination,
            totalSeats: train.total_seats,
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
    console.error("Add train error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
