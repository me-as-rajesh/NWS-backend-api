# Project README

## Overview

This project is a robust backend application built with Node.js and Express, designed to connect users with skilled workers for various jobs. It features a comprehensive API that supports user and worker registration, job management, a real-time chat system, and a notification service.

## Key Features

- **User and Worker Authentication**: Secure registration and login for both users and workers.
- **Job Management**: Create, update, and delete jobs, and manage proposals from workers.
- **Real-Time Chat**: Enables seamless communication between users and workers.
- **Notification System**: Keeps users and workers informed about important events.
- **Review and Rating System**: Allows users to provide feedback on completed jobs.

## API Documentation

Below is a detailed list of all available API endpoints.

### Authentication (`/api/auth`)

- **`POST /api/auth/register`**: Registers a new user.
- **`POST /api/auth/login`**: Authenticates a user and returns a JWT token.

### Users (`/api/users`)

- **`GET /api/users`**: Retrieves a list of all registered users.
- **`GET /api/users/:id`**: Fetches a specific user by their unique ID.
- **`PUT /api/users/:id`**: Updates the details of a specific user.
- **`DELETE /api/users/:id`**: Removes a user from the system.

### Workers (`/api/workers`)

- **`POST /api/workers/register`**: Registers a new worker.
- **`POST /api/workers/login`**: Authenticates a worker and returns a JWT token.
- **`PUT /api/workers/:id`**: Updates the details of a specific workers.
- **`GET /api/workers`**: Retrieves a list of all registered workers.

### Jobs (`/api/jobs`)

- **`GET /api/jobs`**: Fetches a list of all available jobs.
- **`GET /api/jobs/:id`**: Retrieves a single job by its unique ID.
- **`POST /api/jobs`**: Creates a new job listing.
- **`PUT /api/jobs/:id`**: Updates the details of a specific job.
- **`DELETE /api/jobs/:id`**: Removes a job from the system.
- **`POST /api/jobs/:id/proposals`**: Allows a worker to submit a proposal for a job.
- **`PUT /api/jobs/:id/proposals/:proposalId/accept`**: Accepts a worker's proposal for a job.
- **`PUT /api/jobs/:id/assign`**: Assigns a job to a specific worker.
- **`POST /api/jobs/:id/reviews`**: Creates a review for a completed job.

### Reviews (`/api/reviews`)

- **`GET /api/reviews/worker/:id`**: Retrieves all reviews for a specific worker.

### Chat (`/api/chats`)

- **`POST /api/chats`**: Creates or accesses a one-on-one chat.
- **`GET /api/chats`**: Fetches all chats for the currently logged-in user.
- **`GET /api/chats/:chatId/messages`**: Retrieves all messages from a specific chat.
- **`POST /api/chats/messages`**: Sends a new message in a chat.

### Notifications (`/api/notifications`)

- **`GET /api/notifications`**: Fetches all notifications for the currently logged-in user.
- **`PUT /api/notifications/:id`**: Marks a specific notification as read.

### Job Titles (`/api/titles`)

- **`GET /api/titles`**: Retrieves a list of all available job titles.

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file in the root directory and add the necessary configuration, such as your database connection string and JWT secret.
4. **Run the application**:
   ```bash
   npm start
   ```

## Contributing

Contributions are welcome! If you have any suggestions or find any issues, please open an issue or submit a pull request.
