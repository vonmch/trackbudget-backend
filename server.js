// server.js (Production Ready / PostgreSQL / Monolith)

require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // REQUIRED for deployment

// STRIPE SETUP
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'; 

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION (PostgreSQL) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render
  }
});

// Helper to run queries
const query = async (text, params) => {
  return await pool.query(text, params);
};

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, password, full_name, is_premium) VALUES ($1, $2, $3, false) RETURNING id`, 
      [email, hashed, fullName || '']
    );
    const userId = result.rows[0].id;
    const token = jwt.sign({ id: userId, email }, JWT_SECRET);
    res.json({ token, user: { id: userId, email, fullName, is_premium: false } });
  } catch (e) { res.status(500).json({ error: "Error creating user" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(403).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, is_premium: user.is_premium } });
  } catch (e) { res.status(500).json({ error: "Login error" }); }
});

// --- STRIPE ---
app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'TrackBudgetBuild Premium' },
            unit_amount: 2499,
          },
          quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/settings`,
    });
    res.json({ url: session.url });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/profile/upgrade', authenticateToken, async (req, res) => {
  try {
    await query(`UPDATE users SET is_premium = true WHERE id = $1`, [req.user.id]);
    res.status(200).json({ message: 'Upgraded to Premium!' });
  } catch (error) { res.status(500).json({ error: 'Failed to upgrade' }); }
});

// --- DATA ROUTES ---

app.get('/api/expenses', authenticateToken, async (req, res) => {
  const result = await query(`SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC`, [req.user.id]);
  res.json(result.rows);
});
app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { name, amount, date, want_or_need } = req.body;
  await query(`INSERT INTO expenses (user_id, name, amount, date, want_or_need) VALUES ($1, $2, $3, $4, $5)`, [req.user.id, name, amount, date, want_or_need]);
  res.json({ message: 'Saved' });
});
app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  await query(`DELETE FROM expenses WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
});
app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  const { name, amount, date, want_or_need } = req.body;
  await query(`UPDATE expenses SET name=$1, amount=$2, date=$3, want_or_need=$4 WHERE id=$5 AND user_id=$6`, [name, amount, date, want_or_need, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});

app.get('/api/income', authenticateToken, async (req, res) => {
  const result = await query(`SELECT * FROM income WHERE user_id = $1 ORDER BY date DESC`, [req.user.id]);
  res.json(result.rows);
});
app.post('/api/income', authenticateToken, async (req, res) => {
  const { name, amount, date } = req.body;
  await query(`INSERT INTO income (user_id, name, amount, date) VALUES ($1, $2, $3, $4)`, [req.user.id, name, amount, date]);
  res.json({ message: 'Saved' });
});
app.delete('/api/income/:id', authenticateToken, async (req, res) => {
  await query(`DELETE FROM income WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
});
app.put('/api/income/:id', authenticateToken, async (req, res) => {
  const { name, amount, date } = req.body;
  await query(`UPDATE income SET name=$1, amount=$2, date=$3 WHERE id=$4 AND user_id=$5`, [name, amount, date, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});

app.get('/api/savings', authenticateToken, async (req, res) => {
  const result = await query(`SELECT * FROM savings_buckets WHERE user_id = $1`, [req.user.id]);
  res.json(result.rows);
});
app.post('/api/savings', authenticateToken, async (req, res) => {
  const { name, target_amount, end_date } = req.body;
  await query(`INSERT INTO savings_buckets (user_id, name, target_amount, end_date, current_amount) VALUES ($1, $2, $3, $4, 0)`, [req.user.id, name, target_amount, end_date]);
  res.json({ message: 'Saved' });
});
app.delete('/api/savings/:id', authenticateToken, async (req, res) => {
  await query(`DELETE FROM savings_buckets WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
});
app.put('/api/savings/:id', authenticateToken, async (req, res) => {
  const { name, target_amount, end_date, current_amount } = req.body;
  await query(`UPDATE savings_buckets SET name=$1, target_amount=$2, end_date=$3, current_amount=$4 WHERE id=$5 AND user_id=$6`, [name, target_amount, end_date, current_amount, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});
app.put('/api/savings/:id/add', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  await query(`UPDATE savings_buckets SET current_amount = current_amount + $1 WHERE id=$2 AND user_id=$3`, [amount, req.params.id, req.user.id]);
  res.json({ message: 'Funds added' });
});

app.get('/api/bills', authenticateToken, async (req, res) => {
  const result = await query(`SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC`, [req.user.id]);
  res.json(result.rows);
});
app.post('/api/bills', authenticateToken, async (req, res) => {
  const { name, amount, due_date, type, reminder } = req.body;
  await query(`INSERT INTO bills (user_id, name, amount, due_date, type, reminder, is_paid) VALUES ($1, $2, $3, $4, $5, $6, false)`, [req.user.id, name, amount, due_date, type, reminder]);
  res.json({ message: 'Saved' });
});
app.delete('/api/bills/:id', authenticateToken, async (req, res) => {
  await query(`DELETE FROM bills WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
});
app.put('/api/bills/:id', authenticateToken, async (req, res) => {
  const { name, amount, due_date, type, reminder } = req.body;
  await query(`UPDATE bills SET name=$1, amount=$2, due_date=$3, type=$4, reminder=$5 WHERE id=$6 AND user_id=$7`, [name, amount, due_date, type, reminder, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});
app.put('/api/bills/:id/pay', authenticateToken, async (req, res) => {
  const { is_paid } = req.body;
  await query(`UPDATE bills SET is_paid=$1 WHERE id=$2 AND user_id=$3`, [is_paid, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});

app.get('/api/assets', authenticateToken, async (req, res) => {
  const result = await query(`SELECT * FROM assets WHERE user_id = $1 ORDER BY worth DESC`, [req.user.id]);
  res.json(result.rows);
});
app.post('/api/assets', authenticateToken, async (req, res) => {
  const { name, worth, type } = req.body;
  await query(`INSERT INTO assets (user_id, name, worth, type) VALUES ($1, $2, $3, $4)`, [req.user.id, name, worth, type]);
  res.json({ message: 'Saved' });
});
app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
  await query(`DELETE FROM assets WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
});
app.put('/api/assets/:id', authenticateToken, async (req, res) => {
  const { name, worth, type } = req.body;
  await query(`UPDATE assets SET name=$1, worth=$2, type=$3 WHERE id=$4 AND user_id=$5`, [name, worth, type, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});

app.get('/api/retirement', authenticateToken, async (req, res) => {
  const planResult = await query(`SELECT * FROM retirement WHERE user_id = $1`, [req.user.id]);
  const contribResult = await query(`SELECT SUM(amount) as total FROM retirement_contributions WHERE user_id = $1`, [req.user.id]);
  const safePlan = planResult.rows[0] || { current_age: 0, retire_age: 0, current_savings: 0, retirement_goal: 0 };
  safePlan.total_saved = (parseFloat(safePlan.current_savings) || 0) + (parseFloat(contribResult.rows[0]?.total) || 0);
  res.json(safePlan);
});
app.post('/api/retirement', authenticateToken, async (req, res) => {
  const { current_age, retire_age, current_savings, retirement_goal } = req.body;
  const sql = `
    INSERT INTO retirement (user_id, current_age, retire_age, current_savings, retirement_goal) 
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) 
    DO UPDATE SET current_age = $2, retire_age = $3, current_savings = $4, retirement_goal = $5
  `;
  await query(sql, [req.user.id, current_age, retire_age, current_savings, retirement_goal]);
  res.json({ message: 'Saved' });
});

app.get('/api/retirement/contributions', authenticateToken, async (req, res) => {
  const result = await query(`SELECT * FROM retirement_contributions WHERE user_id = $1 ORDER BY date DESC`, [req.user.id]);
  res.json(result.rows);
});
app.post('/api/retirement/contributions', authenticateToken, async (req, res) => {
  const { amount, date, type } = req.body;
  await query(`INSERT INTO retirement_contributions (user_id, amount, date, type) VALUES ($1, $2, $3, $4)`, [req.user.id, amount, date, type]);
  res.json({ message: 'Saved' });
});
app.delete('/api/retirement/contributions/:id', authenticateToken, async (req, res) => {
  await query(`DELETE FROM retirement_contributions WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
  res.json({ message: 'Deleted' });
});
app.put('/api/retirement/contributions/:id', authenticateToken, async (req, res) => {
  const { amount, date, type } = req.body;
  await query(`UPDATE retirement_contributions SET amount=$1, date=$2, type=$3 WHERE id=$4 AND user_id=$5`, [amount, date, type, req.params.id, req.user.id]);
  res.json({ message: 'Updated' });
});
app.get('/api/retirement/summary', authenticateToken, async (req, res) => {
  const sql = `SELECT type, SUM(amount) as total FROM retirement_contributions WHERE user_id = $1 GROUP BY type ORDER BY total DESC`;
  const result = await query(sql, [req.user.id]);
  res.json(result.rows);
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  const result = await query(`SELECT full_name, email, is_premium, job_description FROM users WHERE id = $1`, [req.user.id]);
  res.json(result.rows[0]);
});
app.post('/api/profile', authenticateToken, async (req, res) => {
  const { full_name, email, job_description } = req.body;
  await query(`UPDATE users SET full_name=$1, email=$2, job_description=$3 WHERE id=$4`, [full_name, email, job_description, req.user.id]);
  res.json({ message: 'Saved' });
});
app.put('/api/profile/password', authenticateToken, async (req, res) => {
  const { newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);
  await query(`UPDATE users SET password=$1 WHERE id=$2`, [hashed, req.user.id]);
  res.json({ message: 'Password updated' });
});
app.delete('/api/account', authenticateToken, async (req, res) => {
  const uid = req.user.id;
  const tables = ['expenses', 'income', 'savings_buckets', 'bills', 'assets', 'retirement', 'retirement_contributions'];
  for (const table of tables) {
    await query(`DELETE FROM ${table} WHERE user_id=$1`, [uid]);
  }
  await query(`DELETE FROM users WHERE id=$1`, [uid]);
  res.json({ message: 'Account deleted' });
});
app.get('/api/history', authenticateToken, async (req, res) => {
  const sql = `
    SELECT 'expense' as transaction_type, name, amount, date FROM expenses WHERE user_id=$1 
    UNION ALL 
    SELECT 'income' as transaction_type, name, amount, date FROM income WHERE user_id=$1 
    ORDER BY date DESC LIMIT 100
  `;
  const result = await query(sql, [req.user.id]);
  res.json(result.rows);
});

app.get('/api/notifications', authenticateToken, async (req, res) => {
  // CRASH FIX: Added ::date casting to make Postgres happy comparing Text vs Date
  const sql = `
    SELECT * FROM bills 
    WHERE user_id = $1 
    AND is_paid = false 
    AND due_date::date >= current_date 
    AND due_date::date <= current_date + interval '7 days' 
    ORDER BY due_date ASC
  `;
  const result = await query(sql, [req.user.id]);
  res.json(result.rows);
});

// --- DEPLOYMENT GLUE CODE (SERVE VITE APP) ---
app.use(express.static(path.join(__dirname, 'client/dist')));

// FIX: Use Regex /.*/ to match everything (Bypasses Express 5 strict syntax)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});
// ---------------------------------------------

// STARTUP
(async () => {
  try {
    // CREATE TABLES
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
         id SERIAL PRIMARY KEY, 
         email TEXT UNIQUE NOT NULL, 
         password TEXT NOT NULL, 
         full_name TEXT, 
         is_premium BOOLEAN DEFAULT false, 
         job_description TEXT
       )`,
      `CREATE TABLE IF NOT EXISTS expenses (id SERIAL PRIMARY KEY, user_id INTEGER, name TEXT, amount DECIMAL, date TEXT, want_or_need TEXT)`,
      `CREATE TABLE IF NOT EXISTS income (id SERIAL PRIMARY KEY, user_id INTEGER, name TEXT, amount DECIMAL, date TEXT)`,
      `CREATE TABLE IF NOT EXISTS savings_buckets (id SERIAL PRIMARY KEY, user_id INTEGER, name TEXT, target_amount DECIMAL, end_date TEXT, current_amount DECIMAL DEFAULT 0)`,
      `CREATE TABLE IF NOT EXISTS bills (id SERIAL PRIMARY KEY, user_id INTEGER, name TEXT, amount DECIMAL, due_date TEXT, type TEXT, reminder BOOLEAN DEFAULT false, is_paid BOOLEAN DEFAULT false)`,
      `CREATE TABLE IF NOT EXISTS assets (id SERIAL PRIMARY KEY, user_id INTEGER, name TEXT, worth DECIMAL, type TEXT)`,
      `CREATE TABLE IF NOT EXISTS retirement (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, current_age INTEGER, retire_age INTEGER, current_savings DECIMAL, retirement_goal DECIMAL)`,
      `CREATE TABLE IF NOT EXISTS retirement_contributions (id SERIAL PRIMARY KEY, user_id INTEGER, amount DECIMAL, date TEXT, type TEXT)`
    ];

    for (const sql of tables) {
      await query(sql);
    }
    console.log('Connected to PostgreSQL & Tables Initialized.');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

  } catch (e) {
    console.log("Server running (waiting for DB connection)...");
    app.listen(PORT);
  }
})();