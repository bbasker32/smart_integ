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

  ```cantact me to give you all .env files``` 

4. Start the PostgreSQL database and ensure the `smart_db_name` database exists. You can create it using the following command in the PostgreSQL shell:

   ```sql
   CREATE DATABASE smart_db_name;
   ```

5. Run the database migrations:

   ```bash
   npm run migrate
   ```

6. Start the server:

   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`.

### 3. Set Up the AI Service (service-ai)

1. Navigate to the `service-ai` directory:

   ```bash
   cd ../service-ai
   ```

2. Install the Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up the AI model:

   - Create the `models` directory:
     ```bash
     mkdir -p models
     ```
   
   - Download the Mistral-7B model from HuggingFace:
     - Go to: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF
     - Download the file: `mistral-7b-instruct-v0.1.Q2_K.gguf`
     - Place it in the `service-ai/models/` directory

   For detailed instructions, see [MODEL_SETUP_FR.md](service-ai/MODEL_SETUP_FR.md)

4. Start the AI service:

   ```bash
   uvicorn main:app --reload --port 5001
   ```

   The AI service will run on `http://localhost:5001`.

   **Note:**
   - If you encounter an error when starting the server, it is likely due to a missing Python library.
   - Copy the error message and paste it into ChatGPT to get the name of the missing library.
   - Once you identify the missing library, add it to `requirements.txt` so that other collaborators can install it easily.
   - To install all required libraries, always run:
     ```bash
     pip install -r requirements.txt
     ```

### 4. Set Up the Frontend (Client)

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

### 5. Access the Application

- Open your browser and navigate to `http://localhost:3000` to access the application.

## Project Structure

```
SmartHire_App/
├── client/       # React frontend
├── server/       # Express backend
├── service-ai/   # AI service (FastAPI)
└── README.md     # Project documentation
```

## Scripts

### Backend (Server)

- `npm start`: Start the server in production mode.
- `npm run dev`: Start the server in development mode with hot-reloading.
- `npm run migrate`: Run database migrations.

### AI Service (service-ai)

- `uvicorn main:app --reload --port 5001`: Start the FastAPI server.

### Frontend (Client)

- `npm start`: Start the React development server.
- `npm run build`: Build the React app for production.

## Services
.env
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:5001
