import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyApiKey } from "@/lib/auth"
import { z } from "zod"

// Validation schema for updating seats
const updateSeatsSchema = z.object({
  totalSeats: z.number().int().positive("Total seats must be a positive integer"),
})

export async function PUT(req, { params }) {
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

    const { trainId } = params
    const body = await req.json()

    // Validate request body
    const validation = updateSeatsSchema.safeParse(body)
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

    const { totalSeats } = validation.data

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

    const train = trainResult.rows[0]
    const currentSeats = train.total_seats

    // Start a transaction
    await db.query("BEGIN")

    try {
      // Update total seats in train record
      await db.query("UPDATE trains SET total_seats = $1 WHERE id = $2", [totalSeats, trainId])

      // If increasing seats, add new seats
      if (totalSeats > currentSeats) {
        // Get the current maximum seat number for each coach
        const seatCountResult = await db.query(
          `SELECT SUBSTRING(seat_number, 1, 1) as coach, 
                  MAX(CAST(SUBSTRING(seat_number, 2) AS INTEGER)) as max_seat
           FROM seats 
           WHERE train_id = $1
           GROUP BY coach
           ORDER BY coach`,
          [trainId],
        )

        const seatCounts = seatCountResult.rows
        let seatsToAdd = totalSeats - currentSeats
        const currentCoachIndex = seatCounts.length - 1

        // If no seats exist yet, start with coach A
        if (seatCounts.length === 0) {
          const coaches = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
          let coachIndex = 0
          let seatNum = 1

          while (seatsToAdd > 0) {
            const coach = coaches[coachIndex]
            await db.query("INSERT INTO seats (train_id, seat_number, is_booked) VALUES ($1, $2, $3)", [
              trainId,
              coach + seatNum,
              false,
            ])

            seatsToAdd--
            seatNum++

            // Move to next coach after 50 seats
            if (seatNum > 50) {
              seatNum = 1
              coachIndex++
            }
          }
        } else {
          // Continue from the last coach
          let currentCoach = seatCounts[currentCoachIndex].coach
          let nextSeatNum = Number.parseInt(seatCounts[currentCoachIndex].max_seat) + 1

          const coaches = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
          let coachIndex = coaches.indexOf(currentCoach)

          while (seatsToAdd > 0) {
            // If we've reached 50 seats in this coach, move to the next coach
            if (nextSeatNum > 50) {
              coachIndex++
              currentCoach = coaches[coachIndex]
              nextSeatNum = 1
            }

            await db.query("INSERT INTO seats (train_id, seat_number, is_booked) VALUES ($1, $2, $3)", [
              trainId,
              currentCoach + nextSeatNum,
              false,
            ])

            seatsToAdd--
            nextSeatNum++
          }
        }
      }
      // If decreasing seats, remove seats that aren't booked
      else if (totalSeats < currentSeats) {
        const seatsToRemove = currentSeats - totalSeats

        // Delete unbooked seats, starting from the highest seat numbers
        await db.query(
          `DELETE FROM seats 
           WHERE train_id = $1 
           AND is_booked = FALSE 
           AND id IN (
             SELECT id FROM seats 
             WHERE train_id = $1 
             AND is_booked = FALSE 
             ORDER BY seat_number DESC 
             LIMIT $2
           )`,
          [trainId, seatsToRemove],
        )

        // Check if we were able to remove enough seats
        const remainingSeatsCount = await db.query("SELECT COUNT(*) FROM seats WHERE train_id = $1", [trainId])

        const actualRemainingSeats = Number.parseInt(remainingSeatsCount.rows[0].count)

        // If we couldn't remove enough seats due to bookings, update the total_seats to match reality
        if (actualRemainingSeats > totalSeats) {
          await db.query("UPDATE trains SET total_seats = $1 WHERE id = $2", [actualRemainingSeats, trainId])
        }
      }

      // Commit transaction
      await db.query("COMMIT")

      // Get updated train info
      const updatedTrainResult = await db.query("SELECT * FROM trains WHERE id = $1", [trainId])

      const updatedTrain = updatedTrainResult.rows[0]

      return NextResponse.json(
        {
          success: true,
          message: "Train seats updated successfully",
          train: {
            id: updatedTrain.id,
            name: updatedTrain.name,
            totalSeats: updatedTrain.total_seats,
          },
        },
        { status: 200 },
      )
    } catch (error) {
      // Rollback transaction on error
      await db.query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Update train seats error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
