import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.env.ENVIRONMENT}.env` });
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { sequelize } from './db';
import FileRoutes from './controllers/File';
import FolderRoutes from './controllers/Folder';
import UserRoutes from './controllers/User';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

// User routes
app.use('/user', UserRoutes);
// File routes
app.use('/files', FileRoutes);
// Folder routes
app.use('/folder', FolderRoutes);

(async () => {
  await sequelize.sync({ force: true });

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
})();
