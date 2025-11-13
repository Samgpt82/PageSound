const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT_DIR = __dirname;
const MEMBERS_DIR = path.join(ROOT_DIR, 'members');
const SUBSCRIBERS_FILE = path.join(MEMBERS_DIR, 'subscribers.csv');

app.use(express.static(ROOT_DIR));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function ensureMembersFile() {
  if (!fs.existsSync(MEMBERS_DIR)) {
    fs.mkdirSync(MEMBERS_DIR, { recursive: true });
  }

  if (!fs.existsSync(SUBSCRIBERS_FILE)) {
    fs.writeFileSync(SUBSCRIBERS_FILE, 'email,timestamp\n', 'utf8');
  }
}

app.post('/subscribe', (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email.' });
  }

  ensureMembersFile();

  const timestamp = new Date().toISOString();
  const entry = `${email},${timestamp}\n`;

  fs.appendFile(SUBSCRIBERS_FILE, entry, (err) => {
    if (err) {
      console.error('Failed to save subscriber', err);
      return res.status(500).json({ success: false, message: 'Failed to save subscription. Try again later.' });
    }

    return res.json({ success: true, message: 'Thanks for subscribing!' });
  });
});

app.listen(PORT, () => {
  ensureMembersFile();
  console.log(`Server listening on http://localhost:${PORT}`);
});

