import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts';
import essaysRouter from './routes/essays';
import momentsRouter from './routes/moments';
import projectsRouter from './routes/projects';
import photosRouter from './routes/photos';
import musicRouter from './routes/music';
import uploadRouter from './routes/upload';
import fishRouter from './routes/fish';
import gamesRouter from './routes/games';
import { usersRouter } from './auth';
import getDb from './db';
import { initSchema } from './db/schema';
import { roomPool } from './services/roomPool';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/posts', postsRouter);
app.use('/api/essays', essaysRouter);
app.use('/api/moments', momentsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/albums', photosRouter);
app.use('/api/photos', photosRouter);
app.use('/api/music', musicRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/fish', fishRouter);
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

const DAY_MS = 24 * 60 * 60 * 1000;

async function startServer() {
  try {
    await getDb();
    await initSchema();
    console.log('Database initialized successfully');

    // 启动时确保持久公开大厅房存在，并立即跑一次临时房清理
    await roomPool.ensurePublicRooms();
    const cleaned = await roomPool.destroyTempRooms();
    if (cleaned > 0) console.log(`[RoomPool] cleaned ${cleaned} stale temp room(s)`);
    setInterval(async () => {
      try {
        const n = await roomPool.destroyTempRooms();
        if (n > 0) console.log(`[RoomPool] daily cleanup removed ${n} temp room(s)`);
      } catch (e) {
        console.error('[RoomPool] cleanup error:', e);
      }
    }, DAY_MS);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();