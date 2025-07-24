const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const scanRoutes = require('./routes/scan.route');
const historyRoutes = require('./routes/history.route');
const registerRoutes = require('./routes/register.route');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json());
app.use('/scan', upload.single('file'), scanRoutes);
app.use('/history', historyRoutes);
app.use('/register', registerRoutes);

app.listen(4000, () => console.log('Server running on port 4000'));