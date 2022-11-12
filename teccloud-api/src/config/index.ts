export const env = process.env.ENVIRONMENT || 'dev';
export const port = process.env.PORT || 3001;
export const websiteServer =
  process.env.WEBSITE_SERVER_URL || 'http://localhost:3000';

export const filesFolder = process.env.FILES_FOLDER || 'userfiles/';
export const jwtSecret = process.env.JWT_SECRET || '1234567890';

export const postgres = {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
};
export const sqlite = {
  file: process.env.SQLITE_FILE || './teccloud.sqlite',
};
export const database = postgres.host !== undefined ? 'postgres' : 'sqlite';
console.log(`CONFIG: Starting with ${database} DB`);

export const rabbitmq = {
  available: process.env.RABBITMQ_HOST !== undefined,
  host: process.env.RABBITMQ_HOST,
  user: process.env.RABBITMQ_DEFAULT_USER,
  password: process.env.RABBITMQ_DEFAULT_PASS,
  queue: process.env.RABBITMQ_WORKER_QUEUE,
};
console.log(`CONFIG: RabbitMQ ${rabbitmq.available ? '' : 'not '}available`);
