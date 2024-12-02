## Financial Planner

Finance Tracker is a web application hosted on Vercel that allows users to manage their financial transactions, including adding, editing, and deleting transactions. Users can view their transaction history in a table format, sorted by category, and calculate the total of all transactions. The app supports user authentication and session management using NextAuth.js and a PostgreSQL database.

## Features

User Authentication
Sign Up: Users can create an account with an email and password.
Sign In: Users can securely log in to their account.
Session Management: Persistent user sessions using JSON Web Tokens (JWT).
Sign Out: Users can securely log out.

Transactions Management
Add Transactions: Users can add transactions by specifying category, amount, and an optional description.
Edit Transactions: Users can modify existing transactions with updated details.
Delete Transactions: Users can remove transactions from their history.
Transaction Table: Displays all transactions in a sorted table with a total at the bottom.

## Technologies Used

Frontend
React (Next.js): User interface and client-side logic.
CSS: Styling for the user interface.

Backend
Next.js API Routes: Handle server-side logic for authentication and transactions.
PostgreSQL: Database for storing user and transaction information.
NextAuth.js: User authentication and session management.

## INSTALL INSTRUCTIONS

Prerequisites
    Node.js (v16 or higher)
    PostgreSQL database

Installation
    Clone the Repository:
    git clone <repository-url>
    cd <repository-folder>

    Install Dependencies:
    npm install

    Environment Variables: Create a .env.local file in the root directory and include the following variables:
    POSTGRES_URL=<your-postgres-connection-string>
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=<your-secret-key>

    Run Database Migrations: Set up the users and transactions tables in your PostgreSQL database. Use the following SQL:
    CREATE TABLE users (
        id SERIAL PRIMARY KEY UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL
    );

    CREATE TABLE transactions (
        id SERIAL PRIMARY KEY UNIQUE NOT NULL,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT
    );

    Start the Development Server:
    npm run dev
    Open http://localhost:3000 in your browser.

## USAGE

Sign Up: Create an account using the "Sign Up" button.
Sign In: Log in using your credentials.
Add Transaction: Click "Add Transaction" and fill in the details.
Edit Transaction: Select a transaction to edit and provide updated details.
Delete Transaction: Select a transaction to delete.
View Transactions: See a table of all transactions sorted by category, with a total at the bottom.

## LICENSE
MIT License

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## CONTRIBUTING.MD

Curtis Borson