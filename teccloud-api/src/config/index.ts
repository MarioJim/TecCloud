export const env = process.env.ENVIRONMENT || 'dev';
export const port = process.env.PORT || 3001;
export const websiteServer =
  process.env.WEBSITE_SERVER_URL || 'http://localhost:3000';
export const filesFolder = process.env.FILES_FOLDER || 'userfiles/';
export const jwtSecret = process.env.JWT_SECRET || '1234567890';
export const postgres = {
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
};
export const sqlite = {
  file: process.env.SQLITE_FILE || './teccloud.sqlite',
};
export const database = postgres.host !== undefined ? 'postgres' : 'sqlite';
