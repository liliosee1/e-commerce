 E-Commerce Web Client

A React-based e-commerce web application that consumes the E-Comus API. Built using React, Tailwind CSS, Axios, and TanStack Query.

Features

Products
View product list
Search and filter by category
Product detail page
Pagination or infinite scroll
Loading, error, and empty states

 Cart
Add to cart
Update quantity
Remove items
Persistent cart (survives refresh)
Live total calculation

Checkout & Orders
Place orders
Order confirmation page
View order history

 Authentication
User registration with OTP verification
Login system
Protected routes after login

 Tech Stack
React (Hooks + Router)
Tailwind CSS
Axios (centralized API client)
TanStack Query (server state management)


 API Integration
Built using E-Comus API
Endpoints used:
Products (list, detail, search, filter)
Categories
Cart (add, update, remove)
Orders / Checkout
Authentication (register, OTP, login)
Axios is configured in one central file with base URL and interceptors.

State Management
Server State (TanStack Query)
Products
Cart
Orders
UI State (React useState/useReducer)
Form inputs
Modals
Search input before submit
Toasts / UI toggles

 Authentication Flow
User registers
OTP is sent and verified
User logs in
Token is stored