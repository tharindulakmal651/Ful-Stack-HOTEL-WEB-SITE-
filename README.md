# 🏖️ Araliya Beach Resort & Spa — Hotel Management System v2.0

Full-stack Hotel Management Application built with **React 18**, **Node.js + Express**, and **MySQL 8**.

---

## 📁 Project Structure

```
hotel-app/
├── backend/
│   ├── config/
│   │   ├── db.js               MySQL connection pool
│   │   └── schema.sql          Full schema + seed data (run this first)
│   ├── middleware/
│   │   └── auth.js             JWT auth, admin, optionalAuth middleware
│   ├── routes/
│   │   ├── auth.js             Register / Login / Profile / Change Password
│   │   ├── rooms.js            Room CRUD + availability toggle + filtering
│   │   ├── bookings.js         Create/Read/Update/Cancel bookings
│   │   ├── packages.js         Hotel packages CRUD + toggle active
│   │   ├── restaurant.js       Menu CRUD / Offers CRUD / Orders CRUD
│   │   ├── staff.js            Staff management CRUD
│   │   ├── users.js            Admin user management + reset password
│   │   ├── dashboard.js        Admin stats, revenue, occupancy, check-ins
│   │   └── contact.js          Contact form + admin inbox
│   ├── .env.example
│   ├── package.json
│   └── server.js               Express app with security middleware
│
└── frontend/src/
    ├── context/AuthContext.js  Global auth state
    ├── components/
    │   ├── Navbar.js/.css
    │   └── Footer.js/.css
    ├── pages/
    │   ├── Home.js/.css        Landing page
    │   ├── Rooms.js/.css       Rooms + booking modal
    │   ├── Packages.js/.css    Hotel packages
    │   ├── Restaurant.js/.css  Menu + cart + online ordering
    │   ├── About.js/.css       About + map + staff + amenities
    │   ├── Contact.js/.css     Contact form
    │   ├── Auth.js/.css        Login + Register
    │   ├── Profile.js/.css     Bookings / Orders / Account / Security
    │   └── Admin.js/.css       Full admin dashboard
    ├── styles/global.css
    ├── App.js
    └── index.js
```

---

## 🗄️ Database Tables

| Table                | Purpose                                      |
|----------------------|----------------------------------------------|
| `users`              | Guest & admin accounts (with last_login)     |
| `rooms`              | Room inventory with amenities JSON           |
| `bookings`           | Reservations with conflict detection         |
| `packages`           | Day-out / Wedding / Honeymoon packages       |
| `menu_items`         | Restaurant menu by category                  |
| `food_orders`        | Online food orders with items JSON           |
| `staff`              | Hotel staff profiles                         |
| `restaurant_offers`  | Special dining promotions                    |
| `contact_messages`   | Guest contact form inbox                     |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+

---

### Step 1 — Database

Open MySQL and run the schema:
```bash
mysql -u root -p < backend/config/schema.sql
```
Or paste the contents of `schema.sql` in MySQL Workbench / DBeaver.

This creates all 9 tables and seeds rooms, packages, menu, staff, and offers automatically.

---

### Step 2 — Backend

```bash
cd hotel-app/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_db

JWT_SECRET=replace_with_64+_random_characters
JWT_EXPIRES_IN=7d

# Optional – for contact form email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password
HOTEL_EMAIL=info@araliyaresort.lk
```

Start the server:
```bash
npm run dev    # development (nodemon)
npm start      # production
```

API runs at: **http://localhost:5000**

---

### Step 3 — Frontend

```bash
cd hotel-app/frontend
npm install
npm start
```

Opens at: **http://localhost:3000**

The `"proxy": "http://localhost:5000"` in `frontend/package.json` automatically forwards all `/api` calls to the backend.

---

## 🔐 Default Admin Login

| Field    | Value              |
|----------|--------------------|
| Email    | admin@araliya.com  |
| Password | admin123           |

> ⚠️ **Change this password immediately** in production.

The hashed password in the seed SQL is for `admin123` using bcrypt salt rounds 12.

---

## 📡 Complete API Reference

### Auth — `/api/auth`
| Method | Endpoint            | Access | Description              |
|--------|---------------------|--------|--------------------------|
| POST   | `/register`         | Public | Create guest account     |
| POST   | `/login`            | Public | Login                    |
| GET    | `/me`               | Auth   | Get current user profile |
| PUT    | `/profile`          | Auth   | Update name/phone        |
| PUT    | `/change-password`  | Auth   | Change own password      |

### Rooms — `/api/rooms`
| Method | Endpoint               | Access | Description               |
|--------|------------------------|--------|---------------------------|
| GET    | `/`                    | Public | All available rooms (filter: type, price, guests, dates, page) |
| GET    | `/all`                 | Admin  | All rooms including unavailable |
| GET    | `/types`               | Public | Room type summary         |
| GET    | `/:id`                 | Public | Single room               |
| POST   | `/`                    | Admin  | Create room               |
| PUT    | `/:id`                 | Admin  | Update room               |
| PATCH  | `/:id/availability`    | Admin  | Toggle available/unavailable |
| DELETE | `/:id`                 | Admin  | Delete room               |

### Bookings — `/api/bookings`
| Method | Endpoint        | Access | Description                    |
|--------|-----------------|--------|--------------------------------|
| POST   | `/`             | Auth   | Create booking                 |
| GET    | `/my`           | Auth   | My bookings (filter: status, page) |
| GET    | `/my/summary`   | Auth   | My booking statistics          |
| GET    | `/`             | Admin  | All bookings (filter: status, room_type, dates, search) |
| GET    | `/:id`          | Auth   | Single booking                 |
| PUT    | `/:id`          | Admin  | Update booking status/details  |
| DELETE | `/:id`          | Auth   | Cancel booking                 |

### Packages — `/api/packages`
| Method | Endpoint        | Access | Description              |
|--------|-----------------|--------|--------------------------|
| GET    | `/`             | Public | Active packages (filter: type) |
| GET    | `/all`          | Admin  | All packages             |
| GET    | `/:id`          | Public | Single package           |
| POST   | `/`             | Admin  | Create package           |
| PUT    | `/:id`          | Admin  | Update package           |
| PATCH  | `/:id/toggle`   | Admin  | Toggle active/inactive   |
| DELETE | `/:id`          | Admin  | Delete package           |

### Restaurant — `/api/restaurant`
| Method | Endpoint              | Access | Description              |
|--------|-----------------------|--------|--------------------------|
| GET    | `/menu`               | Public | Active menu (filter: category, vegetarian) |
| GET    | `/menu/all`           | Admin  | Full menu                |
| GET    | `/menu/:id`           | Public | Single item              |
| POST   | `/menu`               | Admin  | Add menu item            |
| PUT    | `/menu/:id`           | Admin  | Update menu item         |
| DELETE | `/menu/:id`           | Admin  | Delete menu item         |
| GET    | `/offers`             | Public | Active offers            |
| GET    | `/offers/all`         | Admin  | All offers               |
| POST   | `/offers`             | Admin  | Create offer             |
| PUT    | `/offers/:id`         | Admin  | Update offer             |
| DELETE | `/offers/:id`         | Admin  | Delete offer             |
| POST   | `/orders`             | Public | Place food order (server-side total validation) |
| GET    | `/orders/my`          | Auth   | My orders                |
| GET    | `/orders`             | Admin  | All orders (filter: status, delivery_type, date) |
| GET    | `/orders/:id`         | Auth   | Single order             |
| PUT    | `/orders/:id`         | Admin  | Update order status      |
| DELETE | `/orders/:id`         | Admin  | Delete order             |

### Staff — `/api/staff`
| Method | Endpoint          | Access | Description              |
|--------|-------------------|--------|--------------------------|
| GET    | `/`               | Public | All staff (filter: department) |
| GET    | `/departments`    | Public | Department summary       |
| GET    | `/:id`            | Public | Single staff member      |
| POST   | `/`               | Admin  | Add staff member         |
| PUT    | `/:id`            | Admin  | Update staff member      |
| DELETE | `/:id`            | Admin  | Remove staff member      |

### Users — `/api/users`
| Method | Endpoint                | Access | Description              |
|--------|-------------------------|--------|--------------------------|
| GET    | `/`                     | Admin  | All users (filter: role, search, page) |
| GET    | `/stats`                | Admin  | User statistics          |
| GET    | `/:id`                  | Admin  | User + booking/order summary |
| PUT    | `/:id`                  | Admin  | Update user              |
| PUT    | `/:id/reset-password`   | Admin  | Reset user password      |
| DELETE | `/:id`                  | Admin  | Delete user account      |

### Dashboard — `/api/dashboard`
| Method | Endpoint                | Access | Description              |
|--------|-------------------------|--------|--------------------------|
| GET    | `/summary`              | Admin  | Full stats overview      |
| GET    | `/revenue/monthly`      | Admin  | Monthly revenue (by year)|
| GET    | `/revenue/by-room-type` | Admin  | Revenue per room type    |
| GET    | `/bookings/recent`      | Admin  | Recent bookings          |
| GET    | `/orders/recent`        | Admin  | Recent food orders       |
| GET    | `/occupancy/today`      | Admin  | Today's room occupancy   |
| GET    | `/checkins/today`       | Admin  | Today's check-ins/outs   |

### Contact — `/api/contact`
| Method | Endpoint    | Access | Description              |
|--------|-------------|--------|--------------------------|
| POST   | `/`         | Public | Submit contact form      |
| GET    | `/`         | Admin  | View all messages        |
| PATCH  | `/:id/read` | Admin  | Mark message as read     |
| DELETE | `/:id`      | Admin  | Delete message           |

---

## 🎨 Frontend Pages

| Page        | Route         | Features                                         |
|-------------|---------------|--------------------------------------------------|
| Home        | `/`           | Hero, quick booking, rooms preview, packages, testimonials, CTA |
| Rooms       | `/rooms`      | Filter by type, real-time availability, booking modal, meal extras |
| Packages    | `/packages`   | Day-out / Wedding / Honeymoon grouped by type    |
| Restaurant  | `/restaurant` | Tabbed menu, cart sidebar, room/dine-in delivery |
| About       | `/about`      | Property info, amenities, nearby attractions, map, staff |
| Contact     | `/contact`    | Contact form + info cards + map                  |
| Login       | `/login`      | Email/password + demo credentials shown          |
| Register    | `/register`   | Guest account creation                           |
| Profile     | `/profile`    | Bookings / Orders / Account Settings / Change Password |
| Admin       | `/admin`      | Overview stats, Bookings, Orders, Rooms (CRUD), Packages (CRUD), Menu (CRUD), Staff (CRUD), Users, Contact Inbox |

---

## 🛡️ Security Features

- **bcryptjs** password hashing (12 salt rounds)
- **JWT** bearer tokens with expiry
- **helmet** HTTP security headers
- **express-rate-limit** — 20 auth attempts / 300 general per 15 min
- **express-validator** input validation on every route
- Admin role protection on all management endpoints
- Conflict detection prevents double-booking
- 24-hour cancellation policy enforced server-side
- Server-side order total recalculation (prevents price manipulation)

---

## 🖼️ Adding Images

Replace placeholder divs in components with:
```jsx
{room.image_url
  ? <img src={room.image_url} alt={room.room_type}
      style={{width:'100%', height:'220px', objectFit:'cover'}} />
  : <div className="img-placeholder room" style={{height:'220px'}} />
}
```

Store images in `frontend/public/images/` or use Cloudinary/S3 URLs in the database.

---

## 📦 Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18, React Router v6, Axios                  |
| Backend    | Node.js, Express 4, express-validator, helmet     |
| Database   | MySQL 8 with mysql2 promise pool                  |
| Auth       | JWT (jsonwebtoken) + bcryptjs                     |
| Email      | Nodemailer (optional, for contact form)           |
| Styling    | Custom CSS, Google Fonts (Playfair Display + Jost)|
| Maps       | Google Maps Embed API                             |

