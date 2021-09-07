const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

app.use((req, res, next) => {
  console.log('Cookies in browser: ', req.cookies);
  res.cookie('name', 'user1');
  next();
});

app.get('/', (req, res) => {
  res.send('Cookie has been set.');
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
