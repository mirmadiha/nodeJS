# SHOPSHERE

This is a Node.js web application built with Express.js. It demonstrates various backend concepts including routing, templating, and database interactions.

## Features

*   **Web Framework:** Express.js
*   **Template Engines:** EJS, Pug, Handlebars
*   **Databases:**
    *   MongoDB (using Mongoose)
    *   MySQL (using Sequelize)
*   **Session Management:** `express-session` with `connect-mongodb-session`
*   **Other Tools:** Body parser for request body parsing.

## Prerequisites

Make sure you have Node.js and npm installed on your machine. You will also need instances of MongoDB and MySQL running depending on which database configuration is currently active in the application.

## Installation

1.  Clone the repository or download the source code.
2.  Navigate to the project directory:
    ```bash
    cd NodeJS
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Running the Application

### Development Mode

To run the application in development mode with automatic restarts on file changes (using `nodemon`):

```bash
npm run dev
```

### Production Mode

To start the application normally:

```bash
npm start
```

The server should start running, typically on port 3000 (or the port defined in your environment variables/`app.js`).

## Project Structure

*   `app.js`: The main entry point of the application.
*   `controllers/`: Contains the controller logic for different routes (e.g., auth, admin, error).
*   `models/`: Defines the data models for the application.
*   `routes/`: Contains the route definitions.
*   `views/`: Contains the templates for rendering pages.
*   `public/`: Static assets like CSS, client-side JavaScript, and images.

## Author

Madiha Aijaz

## License

ISC
