# Algeria20 Backend API

A RESTful API backend built with Express.js, MySQL, Sequelize ORM, and Swagger documentation.

## Features

- Express.js web framework
- MySQL database with Sequelize ORM
- Swagger API documentation
- JWT authentication
- Request validation
- Rate limiting
- Error handling middleware
- Logging with Winston
- CORS support
- Security headers with Helmet

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=algeria20_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

3. Create the MySQL database:
```sql
CREATE DATABASE algeria20_db;
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/api-docs`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   ├── validations/     # Validation schemas
│   ├── constants/       # Constants
│   ├── docs/            # Swagger documentation
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

## License

ISC

