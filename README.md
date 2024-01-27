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
   - Create a MySQL database and update the connection details in the dotenv folder.
   - Setup dotenv folder for dev, test or prod environment

5. **Run Migrations:**
   ```bash
   npx prisma migrate dev
   ```

6. **Start the Server:**
   ```bash
   npm run start-dev
   ```

## Available Scripts

In the project directory, you can run:

- `npm run start-dev`: Starts the application in development mode.
- `npm run start-test`: Starts the application in test mode.
- `npm run start-prod`: Starts the application in production mode.
- `npm run migrate-dev`: Runs Prisma migrations in development mode.
- `npm run migrate-test`: Runs Prisma migrations in test mode.
- `npm run migrate-prod`: Runs Prisma migrations in production mode.
- `npm run push-dev`: Pushes the Prisma schema to the development database and resets it.
- `npm run push-test`: Pushes the Prisma schema to the test database and resets it.
- `npm run push-prod`: Pushes the Prisma schema to the production database and resets it.
- `npm run migrate-reset-dev`: Resets the Prisma migrations in development mode.
- `npm run migrate-reset-test`: Resets the Prisma migrations in test mode.
- `npm run migrate-reset-prod`: Resets the Prisma migrations in production mode.
- `npm run generate-dev`: Generates Prisma client in development mode.
- `npm run generate-test`: Generates Prisma client in test mode.
- `npm run generate-prod`: Generates Prisma client in production mode.

These scripts read configuration from the corresponding `.env` file in the `dotenv` directory.

## API Endpoints

### Admin Routes

#### Protected: true
#### Get Auth: login as admin (/api/admin/auth/login)

- `GET /api/admin/users`: Retrieve a list of all users.
- `GET /api/admin/users/:id`: Retrieve a specific user by ID.
- `PUT /api/admin/users/:id`: Update a specific user by ID.
- `DELETE /api/admin/users/:id`: Delete a specific user by ID.
- `POST /api/admin/users/create/user`: Create a new user.
- `GET /api/admin/organizers`: Retrieve a list of all organizers.
- `GET /api/admin/organizers/:id`: Retrieve a specific organizer by ID.
- `PUT /api/admin/organizers/:id`: Update a specific organizer by ID.
- `DELETE /api/admin/organizers/:id`: Delete a specific organizer by ID.
- `POST /api/admin/organizers/create/organizer`: Create a new organizer.
- `PUT /api/admin/transactions/:id`: Update a specific transaction by ID.
- `DELETE /api/admin/transactions/:id`: Delete a specific transaction by ID.

### Admin Auth Routes

#### Protected: false

- `POST /api/admin/auth/login`: Admin login.

##### Protected for create admin: true
##### Get Auth: login as admin (/api/admin/auth/login)

- `POST /api/admin/auth/create/admin`: Create a new admin.
- `POST /api/admin/auth/logout`: Admin logout.

### User Auth Routes

#### Protected: false

- `POST /api/user/auth/login`: User login.
- `POST /api/user/auth/register`: Register a new user.
- `POST /api/user/auth/logout`: User logout.

### Organizer Auth Routes

#### Protected: false

- `POST /api/organizer/auth/login`: Organizer login.
- `POST /api/organizer/auth/register`: Register a new organizer.
- `POST /api/organizer/auth/logout`: Organizer logout.

### Organizer Routes

#### Protected: true
#### Get Auth: login as organizer (/api/organizer/auth/login)

- `PUT /api/organizer/account`: Update organizer account.
- `GET /api/organizer/account`: Retrieve organizer account.
- `GET /api/organizer/events`: Retrieve a list of all events.
- `POST /api/organizer/events`: Create a new event.
- `GET /api/organizer/events/:id`: Retrieve a specific event by ID.
- `PUT /api/organizer/events/:id`: Update a specific event by ID.
- `DELETE /api/organizer/events/:id`: Delete a specific event by ID.
- `GET /api/organizer/events/:id/tickets`: Retrieve all tickets for a specific event.
- `POST /api/organizer/events/:id/tickets`: Create a new ticket for a specific event.
- `GET /api/organizer/events/:id/tickets/:ticketId`: Retrieve a specific ticket by ID.
- `PUT /api/organizer/events/:id/tickets/:ticketId`: Update a specific ticket by ID.
- `DELETE /api/organizer/events/:id/tickets/:ticketId`: Delete a specific ticket by ID.
- `GET /api/organizer/events/:id/attendees`: Retrieve all attendees for a specific event.
- `GET /api/organizer/events/:id/transactions`: Retrieve all transactions for a specific event.
- `GET /api/organizer/events/:id/transactions/:transactionId`: Retrieve a specific transaction by ID.

### User Routes

#### Protected: true
#### Get Auth: login as user (/api/user/auth/login)

- `GET /api/user/events`: Retrieve a list of all events.
- `GET /api/user/events/:id`: Retrieve a specific event by ID.
- `POST /api/user/createTransactions`: Create a new transaction.
- `GET /api/user/transactions`: Retrieve a list of all transactions.
- `GET /api/user/transactions/:id`: Retrieve a specific transaction by ID.
- `GET /api/user/transaction/:id/transactionTickets`: Retrieve all tickets for a specific transaction.

For detailed API documentation, refer to the API documentation file or explore the routes defined in the code.

## License

This project is licensed under the [MIT License](LICENSE).