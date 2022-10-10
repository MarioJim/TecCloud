import * as dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { sequelize } from './db';
import { port, websiteServer } from './config';
import FileRoutes from './controllers/File';
import UserRoutes from './controllers/User';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: websiteServer, credentials: true }));
app.use(cookieParser());

app.use('/user', UserRoutes);
app.use('/files', FileRoutes);

(async () => {
  await sequelize.sync({ force: true });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
})();
