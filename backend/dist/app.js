"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const posts_1 = __importDefault(require("./routes/posts"));
const essays_1 = __importDefault(require("./routes/essays"));
const moments_1 = __importDefault(require("./routes/moments"));
const projects_1 = __importDefault(require("./routes/projects"));
const photos_1 = __importDefault(require("./routes/photos"));
const music_1 = __importDefault(require("./routes/music"));
const upload_1 = __importDefault(require("./routes/upload"));
const fish_1 = __importDefault(require("./routes/fish"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/posts', posts_1.default);
app.use('/api/essays', essays_1.default);
app.use('/api/moments', moments_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/albums', photos_1.default);
app.use('/api/photos', photos_1.default);
app.use('/api/music', music_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/fish', fish_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});
async function startServer() {
    try {
        await (0, db_1.default)();
        console.log('Database initialized successfully');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=app.js.map