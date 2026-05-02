# API Test Engine

A web-based API testing and mock server platform built from scratch 
using the MERN stack. Test real APIs, create mock endpoints, and 
manage request collections — all from a clean browser interface.

## Features

- **API Tester** — Send GET, POST, PUT, DELETE, PATCH requests to any URL
- **Auth Support** — Custom headers, Bearer token authentication
- **Mock Server** — Create fake API endpoints that return custom JSON responses
- **Dynamic Routing** — Mock endpoints work instantly without server restart
- **Collections** — Save, search, and reload API requests
- **Response Viewer** — Syntax highlighted JSON, status code, response time, size

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| HTTP Client | Axios |
| Architecture | MVC — Models, Controllers, Routes |

## Project Structure

api-test-engine/
├── backend/
│   ├── controllers/
│   │   ├── testController.js
│   │   ├── requestController.js
│   │   ├── mockController.js
│   │   └── mockServerController.js
│   ├── models/
│   │   ├── SavedRequest.js
│   │   └── MockAPI.js
│   ├── routes/
│   │   ├── testRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── mockRoutes.js
│   │   └── mockServerRoutes.js
│   └── server.js
│
└── frontend/
├── src/
│   ├── tabs/
│   │   ├── ApiTester.jsx
│   │   ├── MockAPIs.jsx
│   │   └── SavedRequests.jsx
│   ├── components/
│   │   ├── JsonViewer.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── KeyValueEditor.jsx
│   │   └── MethodSelect.jsx
│   ├── services/
│   │   └── api.js
│   ├── context/
│   │   └── ToastContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── vite.config.js