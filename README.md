# Ekart

Ekart is a small ecommerce storefront built with React and Vite. It includes product browsing, a browser-persisted shopping cart, customer registration and email verification, login, profile editing, password reset, and a role-protected admin user directory.

## Project status

- Product listings are loaded from the external [DummyJSON Products API](https://dummyjson.com/products). Prices and stock are sample data.
- The cart is stored in the browser with Redux Persist; it is not saved to MongoDB.
- Checkout is disabled, and the orders page is a placeholder. There is no order, payment, or product-management API in this project yet.
- The Express API stores user accounts and sessions in MongoDB.

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement)
- npm
- MongoDB running locally or a MongoDB Atlas connection string
- SMTP credentials for email verification and password reset

## Installation

Open a terminal at the project root and install each app's dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

Create environment files from the examples. On PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Edit `backend/.env` with your MongoDB URI, a long random `SECRET_KEY`, and mail credentials before starting the API. Do not commit `.env` files or share their values.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `8000`. |
| `MONGO_URI` | No | MongoDB connection URI; defaults to local MongoDB at `mongodb://127.0.0.1:27017`. The app selects the `ekart` database. |
| `SECRET_KEY` | Yes | Secret used to sign verification, access, and refresh JWTs. Use a long, random value. |
| `MAIL_USER` | Yes for email | Gmail address used as the SMTP account and sender. |
| `MAIL_PASS` | Yes for email | Gmail app password (not your regular account password). |
| `FRONTEND_URL` | Recommended | Frontend origin used in verification links and the CORS allowlist, e.g. `http://localhost:5173`. |

Email uses Gmail SMTP over port 587 with TLS. Gmail account settings and network access must permit SMTP for registration verification and password resets to send.

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | Backend origin, e.g. `http://localhost:8000`. Defaults to that value. Do not put secrets in frontend variables; Vite exposes them to the browser. |

Restart the relevant development server after changing environment files.

## Run locally

Start MongoDB first. Then run the backend and frontend in separate terminals from the project root:

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

Open the frontend URL printed by Vite (normally `http://localhost:5173`). The API runs at `http://localhost:8000`; its user routes are under `/api/v1/user`.

If the backend reports `EADDRINUSE` on port 8000, another process is already using that port. Stop the other backend process or set a different `PORT` and update `VITE_API_URL` to match.

## Main pages

| URL | Page |
| --- | --- |
| `/` | Store home |
| `/products` | Product browsing and filters |
| `/cart` | Local shopping cart |
| `/signup` | Customer registration |
| `/login` | Customer login |
| `/forgot-password` | Email OTP password reset |
| `/profile` | View and edit your name, phone, and address |
| `/admin/login` | Admin login |
| `/admin/users` | Admin user directory |

New registrations have the `user` role. To grant admin access, first register and verify the account, then update that user's role in the `ekart` database using MongoDB Compass or mongosh:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Use the account at `/admin/login`. The API checks the role during admin login and on admin-only API requests.

## API

Base URL: `http://localhost:8000/api/v1/user`

Protected routes require `Authorization: Bearer <accessToken>`. Login returns an access token and a refresh token. Access tokens currently expire after 10 days; refresh tokens expire after 30 days. The frontend refreshes access tokens when an authenticated request receives a 401 response.

| Method | Route | Auth | Request body / purpose |
| --- | --- | --- | --- |
| `POST` | `/register` | No | `{ "firstName", "lastName", "email", "password" }`; creates an account and sends a verification link. |
| `POST` | `/verify` | Verification token | Send the verification token as a Bearer token to verify the account. |
| `POST` | `/reverify` | No | `{ "email" }`; resend the verification link. |
| `POST` | `/login` | No | `{ "email", "password" }`; returns user data and access/refresh tokens. |
| `POST` | `/admin/login` | No | `{ "email", "password" }`; same login response, restricted to verified admins. |
| `POST` | `/refresh` | No | `{ "refreshToken" }`; returns a new access token. |
| `POST` | `/logout` | Yes | Ends the current server-side session. |
| `GET` | `/get-user/:userId` | Yes | Reads your own profile; admins may read any user profile. |
| `PATCH` | `/profile` | Yes | Any subset of `{ "firstName", "lastName", "phoneNo", "address", "city", "zipCode" }`. |
| `POST` | `/forgot-password` | No | `{ "email" }`; sends a one-time password reset code. |
| `POST` | `/verify-otp/:email` | No | `{ "otp" }`; validates the reset code. URL-encode the email parameter. |
| `POST` | `/change-password/:email` | No | `{ "newPassword", "confirmPassword" }`; requires a recently verified reset code. URL-encode the email parameter. |
| `GET` | `/all-user` | Admin | Lists users without password or reset/verification secrets. |

Example customer login:

```bash
curl -X POST http://localhost:8000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","password":"your-password"}'
```

Example profile update (replace the token):

```bash
curl -X PATCH http://localhost:8000/api/v1/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"phoneNo":"+1 555 123 4567","city":"Springfield"}'
```

## Development checks

Run the frontend lint and production build:

```bash
cd frontend
npm run lint
npm run build
```

Backend syntax check (PowerShell):

```powershell
Get-ChildItem -Recurse -File backend -Filter *.js |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

## Troubleshooting

- **MongoDB connection failed:** confirm MongoDB is running and `MONGO_URI` is correct. For Atlas, use the database user's credentials, URL-encode special characters in the password, and allow the client IP in Atlas Network Access.
- **Verification or reset email fails:** check `MAIL_USER`, `MAIL_PASS`, Gmail app password setup, SMTP network access, and backend terminal output.
- **Browser reports CORS errors:** set `FRONTEND_URL` to the exact frontend origin, including scheme and port, then restart the backend.
- **Product listing is empty or errors:** product data is fetched from DummyJSON, so the browser needs internet access and the service must be reachable.
- **Build reports a large chunk:** the current production build emits a JavaScript bundle above Vite's 500 kB advisory threshold. The build still completes; route-level code splitting could reduce it.

## Notes for contributors

- Keep secrets in local `.env` files and rotate any secret that was accidentally committed or shared.
- Registration assigns the `user` role; never accept a role from the public signup form.
- Admin-only operations must remain protected by backend role checks. Hiding admin UI links is not an authorization control.
- API errors are JSON objects with a `success` boolean and a human-readable `message`.
