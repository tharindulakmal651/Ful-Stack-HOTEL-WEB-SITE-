const db = require('../config/db');

// ════════════════════════════════════════════
//  MENU ITEMS
// ════════════════════════════════════════════

// ── GET /api/restaurant/menu ─────────────────────────────────
const getMenu = async (req, res) => {
  try {
    const { category, vegetarian } = req.query;
    let q      = 'SELECT * FROM menu_items WHERE is_available = TRUE';
    const params = [];
    if (category)            { q += ' AND category = ?';       params.push(category); }
    if (vegetarian === 'true') { q += ' AND is_vegetarian = TRUE'; }
    q += ' ORDER BY category, name ASC';
    const [rows] = await db.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error('[RestaurantController.getMenu]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/restaurant/menu/all  (admin) ────────────────────
const getMenuAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items ORDER BY category, name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[RestaurantController.getMenuAdmin]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/restaurant/menu/:id ─────────────────────────────
const getMenuItemById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Menu item not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[RestaurantController.getMenuItemById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── POST /api/restaurant/menu  (admin) ───────────────────────
const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, description, is_vegetarian, image_url } = req.body;
    const [result] = await db.query(
      `INSERT INTO menu_items (name, category, price, description, is_vegetarian, image_url)
       VALUES (?,?,?,?,?,?)`,
      [name, category, price, description || null, is_vegetarian || false, image_url || null]
    );
    res.status(201).json({ message: 'Menu item added.', id: result.insertId });
  } catch (err) {
    console.error('[RestaurantController.createMenuItem]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/restaurant/menu/:id  (admin) ────────────────────
const updateMenuItem = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Menu item not found.' });

    const m = rows[0];
    const { name, category, price, description, is_vegetarian, is_available, image_url } = req.body;

    await db.query(
      `UPDATE menu_items
         SET name=?, category=?, price=?, description=?,
             is_vegetarian=?, is_available=?, image_url=?
       WHERE id=?`,
      [
        name          ?? m.name,
        category      ?? m.category,
        price         ?? m.price,
        description   ?? m.description,
        is_vegetarian !== undefined ? is_vegetarian : m.is_vegetarian,
        is_available  !== undefined ? is_available  : m.is_available,
        image_url     ?? m.image_url,
        req.params.id
      ]
    );
    res.json({ message: 'Menu item updated.' });
  } catch (err) {
    console.error('[RestaurantController.updateMenuItem]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/restaurant/menu/:id  (admin) ─────────────────
const deleteMenuItem = async (req, res) => {
  try {
    await db.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    console.error('[RestaurantController.deleteMenuItem]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ════════════════════════════════════════════
//  RESTAURANT OFFERS
// ════════════════════════════════════════════

// ── GET /api/restaurant/offers ───────────────────────────────
const getOffers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM restaurant_offers
       WHERE is_active = TRUE
         AND (valid_until IS NULL OR valid_until >= CURDATE())
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[RestaurantController.getOffers]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/restaurant/offers/all  (admin) ──────────────────
const getOffersAdmin = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM restaurant_offers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[RestaurantController.getOffersAdmin]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── POST /api/restaurant/offers  (admin) ─────────────────────
const createOffer = async (req, res) => {
  try {
    const { title, description, discount_percent, valid_from, valid_until } = req.body;
    const [result] = await db.query(
      `INSERT INTO restaurant_offers
         (title, description, discount_percent, valid_from, valid_until)
       VALUES (?,?,?,?,?)`,
      [title, description || null, discount_percent || 0, valid_from || null, valid_until || null]
    );
    res.status(201).json({ message: 'Offer created.', id: result.insertId });
  } catch (err) {
    console.error('[RestaurantController.createOffer]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/restaurant/offers/:id  (admin) ──────────────────
const updateOffer = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM restaurant_offers WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Offer not found.' });

    const o = rows[0];
    const { title, description, discount_percent, valid_from, valid_until, is_active } = req.body;

    await db.query(
      `UPDATE restaurant_offers
         SET title=?, description=?, discount_percent=?,
             valid_from=?, valid_until=?, is_active=?
       WHERE id=?`,
      [
        title            ?? o.title,
        description      ?? o.description,
        discount_percent ?? o.discount_percent,
        valid_from       ?? o.valid_from,
        valid_until      ?? o.valid_until,
        is_active        !== undefined ? is_active : o.is_active,
        req.params.id
      ]
    );
    res.json({ message: 'Offer updated.' });
  } catch (err) {
    console.error('[RestaurantController.updateOffer]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/restaurant/offers/:id  (admin) ───────────────
const deleteOffer = async (req, res) => {
  try {
    await db.query('DELETE FROM restaurant_offers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Offer deleted.' });
  } catch (err) {
    console.error('[RestaurantController.deleteOffer]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ════════════════════════════════════════════
//  FOOD ORDERS
// ════════════════════════════════════════════

// ── POST /api/restaurant/orders ──────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      items, delivery_type = 'restaurant',
      guest_name, room_number, special_instructions
    } = req.body;

    // Verify all items exist and are available; recalculate total server-side
    const ids = items.map(i => i.id);
    const [menuItems] = await db.query(
      `SELECT id, name, price, is_available
       FROM menu_items
       WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    if (menuItems.length !== ids.length)
      return res.status(400).json({ message: 'One or more menu items not found.' });

    const unavailable = menuItems.filter(m => !m.is_available);
    if (unavailable.length)
      return res.status(400).json({
        message: `Item(s) currently unavailable: ${unavailable.map(m => m.name).join(', ')}`
      });

    const menuMap = {};
    menuItems.forEach(m => { menuMap[m.id] = m; });

    const enrichedItems = items.map(i => ({
      id:    i.id,
      name:  menuMap[i.id].name,
      price: menuMap[i.id].price,
      qty:   i.qty
    }));

    const total_amount = parseFloat(
      enrichedItems.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)
    );

    const user_id = req.user ? req.user.id : null;

    const [result] = await db.query(
      `INSERT INTO food_orders
         (user_id, guest_name, room_number, items,
          total_amount, delivery_type, special_instructions)
       VALUES (?,?,?,?,?,?,?)`,
      [
        user_id,
        guest_name    || null,
        room_number   || null,
        JSON.stringify(enrichedItems),
        total_amount,
        delivery_type,
        special_instructions || null
      ]
    );

    res.status(201).json({
      message: 'Order placed successfully.',
      id: result.insertId,
      total_amount
    });
  } catch (err) {
    console.error('[RestaurantController.createOrder]', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// ── GET /api/restaurant/orders/my ────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM food_orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    })));
  } catch (err) {
    console.error('[RestaurantController.getMyOrders]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/restaurant/orders  (admin) ──────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { status, delivery_type, date, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let q      = 'SELECT * FROM food_orders WHERE 1=1';
    const params = [];
    if (status)        { q += ' AND status = ?';           params.push(status); }
    if (delivery_type) { q += ' AND delivery_type = ?';    params.push(delivery_type); }
    if (date)          { q += ' AND DATE(created_at) = ?'; params.push(date); }

    const [cnt] = await db.query(
      q.replace('SELECT *', 'SELECT COUNT(*) AS total'), params
    );

    q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(q, params);
    const parsed = rows.map(o => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
    }));

    res.json({
      data: parsed,
      pagination: { total: cnt[0].total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    console.error('[RestaurantController.getAllOrders]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── GET /api/restaurant/orders/:id ───────────────────────────
const getOrderById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM food_orders WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Order not found.' });

    const order = rows[0];
    if (req.user.role !== 'admin' && order.user_id !== req.user.id)
      return res.status(403).json({ message: 'Access denied.' });

    order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    res.json(order);
  } catch (err) {
    console.error('[RestaurantController.getOrderById]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── PUT /api/restaurant/orders/:id  (admin) ──────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM food_orders WHERE id = ?', [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Order not found.' });

    await db.query(
      'UPDATE food_orders SET status = ? WHERE id = ?',
      [req.body.status, req.params.id]
    );
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    console.error('[RestaurantController.updateOrderStatus]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ── DELETE /api/restaurant/orders/:id  (admin) ───────────────
const deleteOrder = async (req, res) => {
  try {
    await db.query('DELETE FROM food_orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted.' });
  } catch (err) {
    console.error('[RestaurantController.deleteOrder]', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  // menu
  getMenu, getMenuAdmin, getMenuItemById,
  createMenuItem, updateMenuItem, deleteMenuItem,
  // offers
  getOffers, getOffersAdmin,
  createOffer, updateOffer, deleteOffer,
  // orders
  createOrder, getMyOrders, getAllOrders,
  getOrderById, updateOrderStatus, deleteOrder
};
