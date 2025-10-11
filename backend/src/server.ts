// Load environment variables as early as possible
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`ShelfAI backend running on http://localhost:${PORT}`);
});