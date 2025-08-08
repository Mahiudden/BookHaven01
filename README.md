# Virtual Bookshelf - Frontend

This is the frontend application for the Virtual Bookshelf project, built with React and Tailwind CSS.

## live url: https://bookhaven02.netlify.app/

## Features

- Browse books by categories.
- Search for books by title or author.
- View detailed information about a book.
- Read and write reviews for books.
- Like and bookmark books (requires login).
- User authentication (Login/Register).
- User profile page.
- Bookshelf page to manage owned, bookmarked, and liked books.

## Technologies Used

- **React:** JavaScript library for building user interfaces.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **React Router DOM:** For handling navigation.
- **Axios:** Promise-based HTTP client for making API requests.
- **Firebase Authentication:** For user login and registration.
- **Framer Motion:** For animations.
- **date-fns:** For date formatting.

## Setup

Follow these steps to get the frontend application running locally.

### Prerequisites

- Node.js and npm (or yarn) installed.
- The backend server (from the main project) must be running.

### Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/Programming-Hero-Web-Course4/b11a11-client-side-Mahiudden.git
   cd <repository_directory>
   ```

2. Navigate to the `client` directory:
   ```bash
   cd client
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create a `.env` file in the `client` directory and add your Firebase configuration and backend API URL:
   ```env
   REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
   REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   REACT_APP_FIREBASE_MEASUREMENT_ID=YOUR_FIREBASE_MEASUREMENT_ID
   REACT_APP_BACKEND_API_URL=http://localhost:5000 # Or your backend server URL
   ```
   Replace the placeholder values with your actual Firebase project details.

### Running the Development Server

1. Make sure you are in the `client` directory.
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The application should now be running at `http://localhost:5173` (or another port if 3000 is in use).

## Project Structure

```
client/
├── public/
├── src/
│   ├── assets/
│   ├── components/  # Reusable UI components
│   ├── context/     # React Context for state management (e.g., AuthContext)
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Route components
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main application component and routing
│   ├── index.js     # Entry point
│   ├── styles.css   # Tailwind CSS main file
│   └── ...
├── package.json
├── README.md
├── tailwind.config.js
└── ...
```


