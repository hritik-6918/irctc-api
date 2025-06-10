import { Pool } from "pg"

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Helper function to execute queries
export const db = {
  query: (text, params) => pool.query(text, params),
  getClient: async () => {
    const client = await pool.connect()
    const query = client.query
    const release = client.release

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error("A client has been checked out for more than 5 seconds!")
      console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }

    client.release = () => {
      clearTimeout(timeout)
      client.query = query
      client.release = release
      return release.apply(client)
    }

    return client
  },
}
