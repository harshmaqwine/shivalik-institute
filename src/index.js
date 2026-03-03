const express = require('express');
const cors = require("cors");
console.log("hjhj");
const dotenv = require("dotenv");
const yargs = require('yargs');

const argv = yargs.argv;
const appEnv = argv.env || process.env.NODE_ENV || 'dev';

// Set NODE_ENV to match the chosen environment
process.env.NODE_ENV = appEnv;
const envFile = `.env.${appEnv}`;
console.log("🔹 Loading environment file:", envFile);

dotenv.config({ path: envFile });

console.log(`Loaded environment: ${appEnv}`);
console.log(`MongoDB URL: ${process.env.ENTRYTRACKING_DB_URL}`);
console.log(`Database Name: ${process.env.DB_NAME}`);

const fileUpload = require('express-fileupload');
const app = express();

const bodyParser = require('body-parser');
const path = require("path");
const fs = require('fs');
const db = require("./models/index.js");
const { job } = require("./console/cron");
const commonConfig = require("./config/common");
const logApiCalls = require('./middleware/loggerMiddleware.js');
const throttleCalls = require('./middleware/throttleMiddleware.js');
const cron = require('node-cron');
const { setupUsersRabbitMQ, setupTerritoryRabbitMQ } = require('./libs/rabbitmq.js');

var whitelist = [

    'localhost:3056',
    'localhost:3057',
    'localhost:3058'
];

const allowedOrigins = [
  "http://localhost:3056",
  "http://localhost:3057",
  "http://localhost:3058",
  "https://shivalik-institute.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {

    // allow requests with no origin (like mobile apps / postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
};


app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(throttleCalls); // Log all API calls

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use(logApiCalls); // Log all API calls

// Import versioned router
const v1Routes = require('./routes');

// Use versioned routes
app.use('/api/v1', v1Routes);

// Start RabbitMQ consumer
setupUsersRabbitMQ().catch(err => console.error('Failed to start User RabbitMQ:', err));
setupTerritoryRabbitMQ().catch(err => console.error('Failed to start Territory RabbitMQ:', err));

app.get("/", (req, res) => {
    res.json({ message: `Welcome to FIRST application. Hello : ${envFile}` });
});

app.use(express.static(__dirname + '/uploads/'));

const PORT = process.env.PORT || 3056;

const server = app.listen(PORT, '0.0.0.0', () => {
  // syncUserRoles()
  // syncLeadData()
    console.log(`http://localhost:${PORT}.`);
    // console.log(`http://192.168.0.218:${PORT}.`);
    // console.log(`http://192.168.0.7:${PORT}.`);
});

