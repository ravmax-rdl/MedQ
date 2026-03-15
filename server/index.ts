import express from 'express';
import cors from 'cors';
import './db';

import authRouter from './routes/auth';
import queueRouter from './routes/queue';
import manageRouter from './routes/manage';
import appointmentsRouter from './routes/appointments';
import manageAppointmentsRouter from './routes/manage-appointments';
import statsRouter from './routes/stats';

const app = express();
const PORT = 3001;

// CORS configuration to allow all localhost variants and remote IPs
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins with localhost, 127.0.0.1, or any IP in dev
      // For production, restrict this appropriately
      if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1|(\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9-]+\.local)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev mode
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/queue', queueRouter);
app.use('/api/queue', manageRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/appointments', manageAppointmentsRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MedQ server running at http://0.0.0.0:${PORT}`);
});
