# Sales Management Web Application (MERN)

Simple MERN project for managers to:
- register users and login
- register customers
- register products
- record daily sales
- edit and delete customers/products
- auto-reduce product quantity when a sale is recorded

## Tech
- React (Vite) frontend
- Express + MongoDB (Mongoose) backend
- React Router for separate pages
- JWT authentication

## Run Backend
1. `cd server`
2. Copy `.env.example` to `.env`
3. Start MongoDB local server
4. `npm install`
5. `npm run dev`

Backend runs on `http://localhost:5000`.

## Run Frontend
1. `cd client`
2. Copy `.env.example` to `.env`
3. `npm install`
4. `npm run dev`

Frontend runs on `http://localhost:5173`.

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/POST /api/products`
- `PUT/DELETE /api/products/:id`
- `GET/POST /api/customers`
- `PUT/DELETE /api/customers/:id`
- `GET/POST /api/sales`

## Notes
- Product/customer/sales endpoints are protected and require Bearer token.
- Sales endpoint checks stock and decreases product quantity.
- Sale stores unit price and total at sale time.
