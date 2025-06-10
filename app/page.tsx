import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">IRCTC API</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/api-docs" className="hover:underline">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="https://github.com/hritik-6918/irctc-api" className="hover:underline">
                  GitHub
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Railway Management System API</h2>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Features</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>User authentication (register, login)</li>
              <li>Admin operations (add trains, update seats)</li>
              <li>Check train availability between stations</li>
              <li>Real-time seat availability checking</li>
              <li>Secure seat booking with race condition handling</li>
              <li>Booking details retrieval</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Tech Stack</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Node.js with Express.js</li>
              <li>PostgreSQL database</li>
              <li>JWT for authentication</li>
              <li>API key for admin endpoints</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
            <p className="mb-4">Follow the instructions in the README.md to set up and run the project.</p>
            <div className="flex space-x-4">
              <Link href="/api-docs" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
                View API Documentation
              </Link>
              <Link
                href="https://github.com/hritik-6918/irctc-api"
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        <p>© 2024 IRCTC API Project</p>
      </footer>
    </div>
  )
}
