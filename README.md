# Expense Tracker

A web application to manage personal expenses, track spending, and view expense summaries.

## Features
- User registration and login
- Add and delete expenses
- Categorize expenses
- View spending summaries
- Dashboard charts and budget information

## Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** bcrypt and Express sessions

## Run Locally

1. Install Node.js and MongoDB.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root containing:

   ```dotenv
   MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
   ```

4. Start the application:

   ```bash
   node --env-file=.env backend/server.js
   ```

5. Open `http://localhost:5000` in your browser.

## Contributors

This project was developed collaboratively. Credit the original project team and describe each contributor's actual responsibilities.
