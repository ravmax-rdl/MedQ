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

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/queue', queueRouter);
app.use('/api/queue', manageRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/appointments', manageAppointmentsRouter);
app.use('/api/stats', statsRouter);

app.listen(PORT, () => {
  console.log(`MedQ server running at http://localhost:${PORT}`);
});
