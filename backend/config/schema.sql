-- ============================================================
--  Araliya Beach Resort & Spa — Full Database Schema v2.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  UNIQUE NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  phone       VARCHAR(25)   DEFAULT NULL,
  role        ENUM('guest','admin') DEFAULT 'guest',
  last_login  DATETIME      DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ── Rooms ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  room_number      VARCHAR(10)   UNIQUE NOT NULL,
  room_type        ENUM('Standard','Deluxe','Premier','Suite') NOT NULL,
  view_type        VARCHAR(80)   DEFAULT NULL,
  price_per_night  DECIMAL(10,2) NOT NULL,
  max_guests       INT           DEFAULT 2,
  description      TEXT          DEFAULT NULL,
  amenities        JSON          DEFAULT NULL,
  image_url        VARCHAR(500)  DEFAULT NULL,
  image_urls       JSON          DEFAULT NULL,
  is_available     BOOLEAN       DEFAULT TRUE,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type      (room_type),
  INDEX idx_available (is_available)
) ENGINE=InnoDB;

-- ── Bookings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT           NOT NULL,
  room_id          INT           NOT NULL,
  check_in         DATE          NOT NULL,
  check_out        DATE          NOT NULL,
  guests           INT           DEFAULT 1,
  extras           ENUM('none','breakfast','lunch_dinner') DEFAULT 'none',
  total_price      DECIMAL(10,2) NOT NULL,
  status           ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  special_requests TEXT          DEFAULT NULL,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id)  ON DELETE CASCADE,
  INDEX idx_user      (user_id),
  INDEX idx_room      (room_id),
  INDEX idx_status    (status),
  INDEX idx_check_in  (check_in),
  INDEX idx_check_out (check_out)
) ENGINE=InnoDB;

-- ── Packages ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  type        ENUM('day-out','wedding','honeymoon') NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  description TEXT          DEFAULT NULL,
  includes    JSON          DEFAULT NULL,
  duration    VARCHAR(60)   DEFAULT NULL,
  image_url   VARCHAR(500)  DEFAULT NULL,
  is_active   BOOLEAN       DEFAULT TRUE,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type      (type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ── Menu Items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  category      ENUM('breakfast','lunch','dinner','beverage','dessert') NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  description   TEXT          DEFAULT NULL,
  is_vegetarian BOOLEAN       DEFAULT FALSE,
  is_available  BOOLEAN       DEFAULT TRUE,
  image_url     VARCHAR(500)  DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category  (category),
  INDEX idx_available (is_available)
) ENGINE=InnoDB;

-- ── Food Orders ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_orders (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT           DEFAULT NULL,
  guest_name           VARCHAR(100)  DEFAULT NULL,
  room_number          VARCHAR(10)   DEFAULT NULL,
  items                JSON          NOT NULL,
  total_amount         DECIMAL(10,2) NOT NULL,
  delivery_type        ENUM('room','restaurant') DEFAULT 'restaurant',
  status               ENUM('pending','preparing','ready','delivered','cancelled') DEFAULT 'pending',
  special_instructions TEXT          DEFAULT NULL,
  created_at           TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user      (user_id),
  INDEX idx_status    (status),
  INDEX idx_created   (created_at)
) ENGINE=InnoDB;

-- ── Staff ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  position    VARCHAR(100)  NOT NULL,
  department  VARCHAR(100)  DEFAULT NULL,
  email       VARCHAR(150)  DEFAULT NULL,
  phone       VARCHAR(25)   DEFAULT NULL,
  bio         TEXT          DEFAULT NULL,
  image_url   VARCHAR(500)  DEFAULT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_department (department)
) ENGINE=InnoDB;

-- ── Restaurant Offers ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurant_offers (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(150)  NOT NULL,
  description      TEXT          DEFAULT NULL,
  discount_percent INT           DEFAULT 0,
  valid_from       DATE          DEFAULT NULL,
  valid_until      DATE          DEFAULT NULL,
  is_active        BOOLEAN       DEFAULT TRUE,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_is_active   (is_active),
  INDEX idx_valid_until (valid_until)
) ENGINE=InnoDB;

-- ── Contact Messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  phone       VARCHAR(25)   DEFAULT NULL,
  subject     VARCHAR(200)  NOT NULL,
  message     TEXT          NOT NULL,
  is_read     BOOLEAN       DEFAULT FALSE,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  SEED DATA
-- ============================================================

-- Admin (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@araliya.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhcanFp8RewH0fNTPq/2uq', 'admin');

-- Rooms
INSERT IGNORE INTO rooms (room_number, room_type, view_type, price_per_night, max_guests, description, amenities) VALUES
('101','Standard','Garden View', 89.00, 2,
 'Comfortable standard room with peaceful garden view and all essential amenities.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Hair Dryer"]'),
('102','Standard','Garden View', 89.00, 2,
 'Cozy standard room overlooking the tropical garden with twin bed configuration.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe"]'),
('201','Deluxe','Sea View', 149.00, 2,
 'Spacious deluxe room with stunning sea view, private balcony, and king-size bed.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Balcony","Bathtub","Room Service"]'),
('202','Deluxe','Sea View', 149.00, 3,
 'Spacious deluxe room with sea view, twin beds, ideal for friends or family.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Balcony","Room Service"]'),
('203','Deluxe','Sea View', 159.00, 2,
 'Romantic deluxe room with corner balcony for panoramic ocean views.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Corner Balcony","Bathtub","Room Service"]'),
('301','Premier','Panoramic Sea View', 229.00, 3,
 'Luxurious premier room with floor-to-ceiling windows and breathtaking 180° sea views.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Balcony","Jacuzzi","Butler Service","Nespresso Machine","Pillow Menu"]'),
('302','Premier','Panoramic Sea View', 229.00, 3,
 'Premium room with private plunge pool terrace and panoramic ocean vistas.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Private Pool Terrace","Jacuzzi","Butler Service","Nespresso Machine"]'),
('401','Suite','360° Ocean View',   389.00, 4,
 'Our crown jewel — a sprawling two-room suite with 360° ocean views, private dining, and exclusive butler service.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Private Balcony","Jacuzzi","Butler Service","Living Room","Dining Area","Kitchenette","Pillow Menu","Nespresso Machine","Complimentary Minibar"]'),
('402','Suite','Ocean & Garden View', 349.00, 4,
 'Elegant garden-facing suite with ocean glimpses, perfect for families.',
 '["Free WiFi","Air Conditioning","Smart TV","Mini Bar","Safe","Balcony","Jacuzzi","Butler Service","Living Room","Kitchenette"]');

-- Packages
INSERT IGNORE INTO packages (name, type, price, description, includes, duration) VALUES
('Beach Day Escape', 'day-out', 99.00,
 'The perfect day by the sea — enjoy our private beach, poolside relaxation, and a delicious lunch included.',
 '["Beach Access","Lunch Buffet","2 Water Sports Activities","Sun Lounger & Umbrella","Welcome Tropical Drink","Towel Service"]',
 '8 hours (9 AM – 5 PM)'),

('Sunset Day Package', 'day-out', 159.00,
 'A premium full-day experience culminating in a spectacular sunset cocktail session on the beachfront terrace.',
 '["Beach & Pool Access","Lunch Buffet","Sunset Cocktails (2 drinks)","Snorkeling Trip","Sun Lounger & Umbrella","Welcome Drink","Towel Service","Spa Discount 20%"]',
 '10 hours (10 AM – 8 PM)'),

('Grand Beachfront Wedding', 'wedding', 3499.00,
 'Exchange your vows on our private white-sand beach as the Indian Ocean provides the ultimate backdrop. An all-inclusive package for an unforgettable day.',
 '["Beach Ceremony Setup for 50 Guests","Floral Arch & Decorations","Professional Photography (8 hrs)","4-Tier Wedding Cake","Catering — 3-Course Dinner (50 pax)","Live Music Duo","Bridal Suite for 2 nights","Sunset Honeymoon Cocktails","Coordination Team","Wedding Car"]',
 '1 day + 2 nights'),

('Intimate Garden Wedding', 'wedding', 1799.00,
 'A beautifully intimate ceremony in our tropical garden for the couple who wants something personal and magical.',
 '["Garden Ceremony Setup for 20 Guests","Floral Decorations","Photography (5 hrs)","Wedding Cake","Catering — Buffet (20 pax)","Bridal Suite for 1 night","Champagne Toast","Coordination Team"]',
 '1 day + 1 night'),

('Romantic Honeymoon Retreat', 'honeymoon', 649.00,
 'Begin your forever together in paradise. Three enchanting nights designed exclusively for newlyweds.',
 '["Deluxe Sea View Room (3 nights)","Breakfast in Bed Daily","Couples Spa Treatment (60 min)","Candle-lit Dinner on the Beach","Rose Petal Turndown Service","Welcome Champagne & Chocolates","Late Check-out (2 PM)"]',
 '3 nights'),

('Luxury Honeymoon Suite Experience', 'honeymoon', 1199.00,
 'Five nights in our premier suite — the ultimate luxury honeymoon with every detail taken care of.',
 '["Premier Suite (5 nights)","All Meals Included","Couples Spa Package (3 sessions)","Private Sunset Cruise (2 hrs)","Romantic Dinner on Private Beach","Rose Bath Experience","Butler Service","Airport Transfer","Welcome Gift Basket","Complimentary Minibar"]',
 '5 nights');

-- Menu Items
INSERT IGNORE INTO menu_items (name, category, price, description, is_vegetarian) VALUES
('Continental Breakfast',  'breakfast', 18.00, 'Freshly baked pastries, seasonal fruit platter, yogurt parfait, fresh juice, and barista coffee.',  TRUE),
('Full English Breakfast',  'breakfast', 22.00, 'Free-range eggs cooked to order, grilled bacon, pork sausages, baked beans, grilled tomato, and sourdough toast.', FALSE),
('Sri Lankan Breakfast',   'breakfast', 16.00, 'Authentic hoppers, string hoppers, coconut sambal, dhal curry, pol roti, and fresh fruit.', TRUE),
('Eggs Benedict',          'breakfast', 19.00, 'Poached free-range eggs on toasted English muffin with Canadian bacon and hollandaise sauce.', FALSE),
('Avocado & Feta Toast',   'breakfast', 15.00, 'Sourdough toast with smashed avocado, crumbled feta, cherry tomatoes, and microgreens.', TRUE),
('Tropical Açaí Bowl',     'breakfast', 14.00, 'Blended açaí base topped with fresh tropical fruits, granola, coconut flakes, and honey.', TRUE),
('Seafood Lunch Buffet',   'lunch',     35.00, 'Extensive spread of fresh local catch, international stations, salads, and live cooking. Changes daily.', FALSE),
('Vegetarian Lunch Buffet','lunch',     28.00, 'Rich selection of vegetarian dishes from Sri Lankan and international cuisines.', TRUE),
('Grilled Mahi-Mahi',      'lunch',     32.00, 'Fresh daily-catch fillet grilled to perfection, lemon-caper butter, chargrilled vegetables.', FALSE),
('Prawn Fried Rice',       'lunch',     26.00, 'Wok-tossed fragrant rice with tiger prawns, mixed vegetables, egg, and sesame oil.', FALSE),
('Club Sandwich',          'lunch',     18.00, 'Triple-decker with grilled chicken, crispy bacon, fried egg, avocado, and fresh salad.', FALSE),
('Caesar Salad',           'lunch',     16.00, 'Crisp romaine, housemade Caesar dressing, parmesan shavings, croutons. Add chicken +$4.', TRUE),
('Gala Dinner Buffet',     'dinner',    48.00, 'Grand evening buffet with live cooking stations, carving station, international dessert bar.', FALSE),
('Candle-lit Gourmet Set Menu','dinner',68.00, '5-course tasting menu with wine pairing — a curated journey of flavours by our Executive Chef.', FALSE),
('Grilled Whole Lobster',  'dinner',    65.00, 'Market-fresh lobster grilled over charcoal, drawn butter, lemon, and seasonal sides.', FALSE),
('Catch of the Day',       'dinner',    38.00, 'Daily-fresh whole fish grilled, steamed, or fried. Ask your server for today\'s selection.', FALSE),
('Lamb Rack', 'dinner',    52.00, 'Herb-crusted Frenched rack of lamb, rosemary jus, roasted root vegetables, and potato gratin.', FALSE),
('Chocolate Lava Cake',    'dessert',   12.00, 'Warm dark-chocolate fondant, molten centre, vanilla bean ice cream and berry coulis.', TRUE),
('Crème Brûlée',           'dessert',   11.00, 'Classic vanilla custard with caramelised sugar crust, seasonal berry garnish.', TRUE),
('Tropical Fruit Platter', 'dessert',   10.00, 'Selection of Sri Lanka\'s finest seasonal fruits, beautifully presented.', TRUE),
('Coconut Mojito',         'beverage',   9.00, 'Fresh coconut water, muddled mint, lime juice, rum (or virgin), crushed ice.', TRUE),
('Mango Lassi',            'beverage',   8.00, 'Blended Alphonso mango, chilled yogurt, cardamom, and rose water.', TRUE),
('Fresh Lime Soda',        'beverage',   6.00, 'Freshly squeezed lime juice, sparkling water, sugar syrup. Sweet or salted.', TRUE),
('Beachside Piña Colada',  'beverage',  11.00, 'White rum, fresh pineapple, coconut cream, blended to frozen perfection.', TRUE);

-- Staff
INSERT IGNORE INTO staff (name, position, department, bio) VALUES
('Mr. Rajitha Perera',      'General Manager',       'Management',  'A hospitality veteran with 22 years across 5-star resorts in Asia. Rajitha\'s leadership has earned the resort multiple awards.'),
('Ms. Chamari Silva',       'Executive Chef',        'Restaurant',  'Classically trained in Paris and Lyon, Chamari blends French technique with authentic Sri Lankan flavours in every dish.'),
('Mr. Nuwan Fernando',      'Front Desk Manager',    'Reception',   'Nuwan leads our front-of-house with warmth and precision, ensuring every guest feels at home from the moment they arrive.'),
('Ms. Dilini Jayawardena',  'Spa Director',          'Wellness',    'A certified Ayurvedic practitioner and therapist, Dilini brings holistic wellness expertise from her training in India.'),
('Mr. Kasun Bandara',       'F&B Manager',           'Restaurant',  'Certified sommelier and food & beverage expert, Kasun curates our wine list and dining experiences.'),
('Ms. Nadeeka Wijesinghe',  'Events Coordinator',    'Events',      'Nadeeka has planned over 200 weddings and corporate events, turning every occasion into a flawless memory.'),
('Mr. Thilina Dissanayake', 'Head of Housekeeping',  'Housekeeping','Thilina\'s team ensures every room meets our exacting standards of cleanliness, comfort, and presentation.');

-- Restaurant Offers
INSERT IGNORE INTO restaurant_offers (title, description, discount_percent, valid_from, valid_until) VALUES
('Early Bird Breakfast',     'Beat the crowd and get 20% off all à la carte breakfast orders placed before 8:00 AM.', 20, '2026-01-01', '2026-12-31'),
('Sunset Happy Hour',        '2-for-1 cocktails and mocktails at the beachfront bar every evening from 5 PM to 7 PM.', 50, '2026-01-01', '2026-12-31'),
('Sunday Family Brunch',     'Children under 10 eat FREE when accompanied by a paying adult at our Sunday lunch buffet.', 0, '2026-01-01', '2026-12-31'),
('Honeymoon Dining Package', 'Guests celebrating their honeymoon enjoy a complimentary candle-lit dinner for two.', 100, '2026-01-01', '2026-12-31');


-- ============================================================
--  HOW TO CREATE A NEW ADMIN ACCOUNT MANUALLY
--
--  The password hash below = "admin123"
--  Run this SQL to create a new admin:
-- ============================================================

-- Option 1: Create brand new admin (change name/email)
-- INSERT INTO users (name, email, password, role) VALUES
-- ('Your Name', 'your@email.com',
--  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhcanFp8RewH0fNTPq/2uq', 'admin');

-- Option 2: Promote an existing guest to admin
-- UPDATE users SET role = 'admin' WHERE email = 'guest@email.com';

-- Option 3: View all current admins
-- SELECT id, name, email, role, created_at FROM users WHERE role = 'admin';

-- ============================================================
--  ADD image_urls COLUMNS (run if upgrading from old schema)
-- ============================================================
-- ALTER TABLE rooms     ADD COLUMN IF NOT EXISTS image_urls JSON DEFAULT NULL;
-- ALTER TABLE packages  ADD COLUMN IF NOT EXISTS image_urls JSON DEFAULT NULL;
