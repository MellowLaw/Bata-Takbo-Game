const fs = require('fs');
const files = [
  'server/server.js',
  'web/src/utils/GuestGuard.js',
  'web/src/utils/StateManager.js',
  'web/src/screens/LoginScreen.js',
  'web/src/screens/ProfileScreen.js'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/sessionStorage/g, 'localStorage');
    c = c.replace(/expiresIn:\s*'1h'/g, "expiresIn: '30d'");
    c = c.replace(/maxAge:\s*3600000/g, 'maxAge: 2592000000');
    fs.writeFileSync(f, c);
    console.log('Fixed', f);
  } else {
    console.log('Not found', f);
  }
});
