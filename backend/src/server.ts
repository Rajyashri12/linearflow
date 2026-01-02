import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventPermission.routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/eventPermissions', eventRoutes);

const PORT = process.env.PORT || 5000;

// This keeps the server alive
app.listen(PORT, () => {
    console.log(`\x1b[32m🚀 Server is active on port ${PORT}\x1b[0m`);
    console.log(`\x1b[36m--- Waiting for Event Applications ---\x1b[0m`);
});