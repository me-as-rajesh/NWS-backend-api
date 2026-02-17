const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const titleRoutes = require('./routes/titleRoutes');
const workerRoutes = require('./routes/workerRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
	res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/titles', titleRoutes);
app.use('/api/workers', workerRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));