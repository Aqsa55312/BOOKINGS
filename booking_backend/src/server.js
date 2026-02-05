import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { typeDefs } from './graphql/schema.js';
import { resolvers, getUserFromToken } from './graphql/resolvers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app for file upload endpoint
const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Enable file upload
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}));

// Serve static files (uploaded avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// File upload endpoint
app.post('/upload/avatar', async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatar = req.files.avatar;
    const fileName = `${Date.now()}-${avatar.name}`;
    const uploadPath = path.join(__dirname, '../uploads/avatars', fileName);

    await avatar.mv(uploadPath);

    const avatarUrl = `${process.env.BACKEND_URL || 'http://localhost:4000'}/uploads/avatars/${fileName}`;
    
    res.json({ url: avatarUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Express server for file uploads
const EXPRESS_PORT = process.env.EXPRESS_PORT || 4001;
app.listen(EXPRESS_PORT, () => {
  console.log(`📁 File upload endpoint ready at http://localhost:${EXPRESS_PORT}/upload/avatar`);
});

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return error;
  },
});

// Start Apollo Server with standalone server
const { url } = await startStandaloneServer(server, {
  listen: { port: parseInt(process.env.PORT) || 4000 },
  context: async ({ req }) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const user = getUserFromToken(token);
    return { req, user };
  },
});

console.log(`🚀 GraphQL server ready at ${url}`);
