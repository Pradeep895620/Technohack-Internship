# Task Management API

A RESTful API built with Node.js, Express, and MongoDB for managing tasks.

## Features

- Full CRUD operations for tasks
- MongoDB database integration
- Input validation
- Error handling
- RESTful routing

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/:id | Get a single task |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/:id | Update a task |
| PATCH | /api/tasks/:id | Partially update a task |
| DELETE | /api/tasks/:id | Delete a task |

## Task Object Structure

```json
{
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "priority": "medium",
  "dueDate": "2024-12-31T00:00:00.000Z"
}