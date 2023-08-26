require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Successfully connected to the database');
  }
});

// Route Files
const expressLayouts = require('express-ejs-layouts');
const route = require('./routes/routes');
const adminRouter = require('./routes/admin');

// Additional files
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/', route);
app.use('/admin', adminRouter);
const PORT = process.env.PORT;
app.listen(PORT,()=>{
  console.log(`App listening on port ${PORT}`)
});
