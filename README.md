# tRicket - Ticketing Web App Backend

tRicket Backend is the server-side component of the tRicket ticketing web application, built with TypeScript. It utilizes MySQL as the database, Prisma for database access, Express.js for handling API requests, Node.js for server-side logic, and JWT for secure authentication.

## Technologies Used

- **Node.js:** JavaScript runtime for server-side development.
- **Express.js:** Web application framework for Node.js, simplifying API development.
- **TypeScript:** Superset of JavaScript that adds static typing.
- **Prisma:** Next-generation Node.js and TypeScript ORM for databases.
- **MySQL:** Relational database for storing event and user data.
- **JWT (JSON Web Tokens):** Securely transmit information between parties.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** [Download and Install Node.js](https://nodejs.org/)
- **MySQL:** [Install MySQL](https://dev.mysql.com/downloads/)

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/tm141/tRicket-backend.git
   ```

2. **Install Dependencies:**
   ```bash
   cd tRicket-backend
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file and set the necessary environment variables. See the example in `.env.example`.

4. **Database Setup:**
   - Create a MySQL database and update the connection details in the `.env` file.

5. **Run Migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the Server:**
   ```bash
   npm start 
   ```

## API Endpoints
**TBA**
<!-- 
- **POST /api/events:** Create a new event.
- **GET /api/events:** Get a list of all events.
- **GET /api/events/:eventId:** Get details of a specific event.
- **POST /api/auth/register:** Register a new user.
- **POST /api/auth/login:** Authenticate and log in a user.
- **POST /api/bookings/:eventId:** Book tickets for a specific event.
- **GET /api/bookings:** Get a list of all bookings for a user.
-->

For detailed API documentation, refer to the API documentation file or explore the routes defined in the code.

## License

This project is licensed under the [MIT License](LICENSE).