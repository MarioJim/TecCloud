import { User } from './db';

// To avoid TypeScript 'not a module' error
export {};

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
}
