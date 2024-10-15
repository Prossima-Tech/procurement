// backend/data/users.js

const bcrypt = require('bcryptjs');

const users = [
  {
    id: 1,
    username: 'user1',
    password: bcrypt.hashSync('password1', 8),
    role: 'user',
  },
  {
    id: 2,
    username: 'admin1',
    password: bcrypt.hashSync('adminpass', 8),
    role: 'admin',
  },
  {
    id: 3,
    username: 'mod1',
    password: bcrypt.hashSync('modpass', 8),
    role: 'moderator',
  },
];

module.exports = users;