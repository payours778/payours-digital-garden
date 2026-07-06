import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts';
import momentsRouter from './routes/moments';
import projectsRouter from './routes/projects';
import photosRouter from './routes/photos';
import getDb from './db';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/posts', postsRouter);
app.use('/api/moments', momentsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/albums', photosRouter);
app.use('/api/photos', photosRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

async function startServer() {
  try {
    await getDb();
    console.log('Database initialized successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();