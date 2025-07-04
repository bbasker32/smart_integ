# SmartHire Application

This is the SmartHire application, a full-stack project with a React frontend and an Express backend. Follow the instructions below to set up and run the project on your local machine.

## Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) (for the database)

## Setup Instructions

### 1. Clone the Repository

```bash
# Clone the repository to your local machine
git clone <repository-url>

# Navigate to the project directory
cd /SmartHire_Part1
```

### 2. Set Up the Backend (Server)

1. Navigate to the `server` directory:

   ```bash
   cd server
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory and configure the following environment variables:

   ```env
   DB_USER=your_postgres_username
   DB_HOST=localhost
   DB_NAME=smart_hire_db
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432

   JWT_SECRET=your_jwt_secret
   ```

4. Start the PostgreSQL database and ensure the `smart_hire_db` database exists. You can create it using the following command in the PostgreSQL shell:

   ```sql
   CREATE DATABASE smart_hire_db;
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`.

### 3. Set Up the Frontend (Client)

1. Navigate to the `client` directory:

   ```bash
   cd ../client
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

   The client will run on `http://localhost:3000`.

### 4. Access the Application

- Open your browser and navigate to `http://localhost:3000` to access the application.

## Project Structure

```
SmartHire_App/
├── client/       # React frontend
├── server/       # Express backend
└── README.md     # Project documentation
```

## Scripts

### Backend (Server)

- `npm start`: Start the server in production mode.
- `npm run dev`: Start the server in development mode with hot-reloading.

### Frontend (Client)

- `npm start`: Start the React development server.
- `npm run build`: Build the React app for production.
