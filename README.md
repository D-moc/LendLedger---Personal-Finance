LendLedger --- Personal Finance

<p align="center">

<strong>{=html}A web-based personal finance platform for managingmoney given, borrowed, and repaid.</strong>{=html}

</p>

<p align="center">

Track financial relationships, payments, outstanding balances, andrecords in one organized platform.

</p>

Overview

LendLedger is a web-based personal finance management platformdesigned to simplify the way individuals track lending and borrowingbetween people.

Instead of relying on notebooks, spreadsheets, or scattered messages,LendLedger provides a centralized place to record financial agreements,monitor outstanding amounts, manage payments, and keep track of peopleconnected to your financial records.

The platform focuses on a clean, minimal, responsive, and easy-to-useinterface while keeping financial information organized and accessible.

Features

Authentication

User registration and login

Protected application routes

Secure authentication

Forgot password functionality

Password reset functionality

Email-based password reset flow

People Management

Add people to your financial network

Store name, phone number, and notes

View individual financial summaries

Edit personal information

Archive people without deleting financial history

Restore archived people

Search people by name

Financial Records

Create and manage financial records

Track money given

Track money borrowed

View original principal

Track outstanding principal

Track outstanding interest

Support interest-based records

Track record status

View detailed individual records

Payments

Record repayments

Track payment history

Monitor remaining balances

Keep financial transactions organized

Search & Filtering

Search people by name

Search financial records

Filter by money given or borrowed

Filter by record status

View total record counts

Dashboard & Reports

Financial activity overview

Money given and borrowed summaries

Outstanding balance information

Visual financial charts

Financial reports and summaries

User Experience

Clean and minimal UI

White and violet visual theme

Responsive design

Mobile-friendly sidebar navigation

Consistent cards, forms, and controls

Simple and intuitive workflows

Tech Stack

Frontend

React

Vite

React Router

Tailwind CSS

Axios

Recharts

Lucide React

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

Development & Deployment

Git

GitHub

Vercel

Architecture

                    ┌──────────────────────┐
                    │        User          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                         REST API / Axios
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express + Node.js  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MongoDB        │
                    │       Database       │
                    └──────────────────────┘

Project Structure

LendLedger/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md

Core Modules

Module                              Description

Authentication                      Registration, login, passwordrecovery, and protected routes

People                              Manage people associated withfinancial records

Records                             Track money given and borrowed

Payments                            Record and monitor repayments

Dashboard                           View overall financial activity

Reports                             Analyze financial records andoutstanding amounts

Settings                            Manage account-related preferences

Record Statuses

Financial records can be organized using:

Active

Partially Paid

Due Soon

Overdue

Settled

These statuses make it easier to understand which financial obligationsrequire attention.

Installation

Prerequisites

Node.js

npm

MongoDB

Git

Clone the repository

git clone https://github.com/YOUR_USERNAME/LendLedger.git
cd LendLedger

Install frontend dependencies

cd client
npm install

Install backend dependencies

Open another terminal:

cd server
npm install

Environment Variables

Create server/.env:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Add any additional environment variables required by your backend.

Create client/.env:

VITE_API_URL=http://localhost:5000/api

Never commit .env files, database credentials, JWT secrets, APIkeys, or email credentials to GitHub.

Running Locally

Start the Backend

Inside server:

npm run dev

or:

npm start

Start the Frontend

Inside client:

npm run dev

The frontend will normally be available at:

http://localhost:5173

API

The frontend communicates with the backend through REST APIs.

Main API areas include:

/api/auth
/api/people
/api/records
/api/payments

Authentication-protected endpoints require a valid authenticatedsession/token.

Security

LendLedger uses application security practices including:

Protected API routes

JWT-based authentication

User-specific data access

Environment variables for sensitive configuration

Password reset functionality

Server-side request validation

Separation of frontend and backend responsibilities

Sensitive configuration should always be stored in environment variablesinstead of source control.

Data Management

People can be archived instead of permanently deleted.

Archiving removes a person from the active people list while preservingtheir financial history. Archived people can be restored later.

This helps prevent accidental loss of financial records.

Deployment

The application is designed to be deployed as separate frontend andbackend services.

                         GitHub
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        Client / React            Server / Express
              │                         │
              ▼                         ▼
           Vercel                    Vercel
                                        │
                                        ▼
                                     MongoDB

Production environment variables should be configured through thedeployment platform rather than committed to the repository.

Production Checklist

Before deploying:

Configure production environment variables.

Set the frontend API URL to the deployed backend.

Configure backend CORS for the deployed frontend domain.

Verify authentication and cookies/tokens.

Test registration and login.

Test password reset.

Test people, records, payments, and reports.

Verify that sensitive credentials are not present in the repository.

Future Improvements

Automated payment reminders

Email notifications

Advanced financial analytics

Export records to PDF/CSV

Recurring payments

Improved reporting dashboards

Mobile application

Enhanced notification system

Multi-currency support

Project Status

Active Development

The core application functionality is implemented and the project isbeing prepared for production deployment.

Contributing

Contributions, suggestions, and improvements are welcome.

Fork the repository.

Create a feature branch:

git checkout -b feature/your-feature

Commit your changes:

git commit -m "Add your feature"

Push the branch:

git push origin feature/your-feature

Open a Pull Request.

License

This project is currently intended for educational and personal use.

Author

Dinesh Bishokarma

GitHub: https://github.com/YOUR_USERNAME

<p align="center">

Built with React, Node.js, Express, and MongoDB.

</p>