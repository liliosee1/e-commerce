# E-Comus Client

This project is a beginner-friendly e-commerce web client built with React, Tailwind CSS, Axios, and TanStack Query. It consumes the live E-Comus API and includes a product catalog, product details, cart management, checkout, and order history.

## Features

- Product listing with search and category filtering
- Product detail page
- Persistent cart stored in local storage
- Checkout flow with order confirmation fallback handling
- Order history page
- Responsive UI built with Tailwind

## Tech Stack

- React
- React Router
- Tailwind CSS
- Axios
- TanStack Query
- Vite

## Setup

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the local URL shown in the terminal.

## Environment

The app uses the API base URL from the included `.env` file:

```env
VITE_API_BASE_URL=https://e-commas-apis-production-e0f8.up.railway.app/api
```

## API Notes

The live API response shape is slightly different from the initial starter code. The app was adapted to use the real nested payload structure from the documentation, especially for product listing and product detail responses.

## Deployment

You can deploy this project on Vercel or Netlify by connecting the repository and using the Vite build command:

```bash
npm run build
```

## Screenshots

Add screenshots here after running the app locally.
 
 Updated: 2026-06-30
