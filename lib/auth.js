import jwt from "jsonwebtoken"

// Verify JWT token from Authorization header
export function verifyToken(req) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

// Verify API key from X-API-KEY header
export function verifyApiKey(req) {
  try {
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
      return false
    }

    // In a real application, you would compare with an API key stored securely
    // For this example, we're using a simple comparison
    return apiKey === process.env.ADMIN_API_KEY || "your-admin-api-key"
  } catch (error) {
    console.error("API key verification error:", error)
    return false
  }
}
