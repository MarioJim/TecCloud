import * as dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { sequelize } from './db';
import UserRoutes from './controllers/User';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 3001;

// User routes
app.use('/user', UserRoutes);

(async () => {
  await sequelize.sync({ force: true });
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
})();
