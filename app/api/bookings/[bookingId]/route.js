import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(req, { params }) {
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

    const { bookingId } = params

    // Get booking details
    const bookingQuery = `
      SELECT b.id, b.source, b.destination, b.passenger_name, 
             b.passenger_age, b.passenger_gender, b.booking_date, b.pnr, b.status,
             t.name as train_name, s.seat_number
      FROM bookings b
      JOIN trains t ON b.train_id = t.id
      JOIN seats s ON b.seat_id = s.id
      WHERE b.id = $1 AND b.user_id = $2
    `

    const bookingResult = await db.query(bookingQuery, [bookingId, tokenData.userId])

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking not found or not authorized to view this booking",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        booking: bookingResult.rows[0],
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get booking details error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
