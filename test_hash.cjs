const bcrypt = require('bcryptjs');
const hash = '$2a$10$h8ESH/4Lo87wCbNLHMEDzOW9AVik3pCdgC782ZtNT9g2a89CGtYU2';
console.log('Without quotes:', bcrypt.compareSync('DennisSecure#2026', hash));
console.log('With quotes:', bcrypt.compareSync('"DennisSecure#2026"', hash));
