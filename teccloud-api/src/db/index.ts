import { Sequelize } from 'sequelize';
import { database, postgres, sqlite } from '../config';

export const sequelize = new Sequelize(
  database === 'postgres'
    ? {
        dialect: 'postgres',
        host: postgres.host,
        database: postgres.database,
        username: postgres.user,
        password: postgres.password,
      }
    : {
        dialect: 'sqlite',
        storage: sqlite.file,
      },
);

import { File } from './file';
import { FileAccess } from './fileaccess';
import { Folder } from './folder';
import { Page } from './page';
import { User } from './user';

File.belongsToMany(User, { through: FileAccess });
export const PagesOnAFile = File.hasMany(Page);
Folder.hasOne(User);
Folder.belongsTo(Folder, { foreignKey: 'parentId', onDelete: 'cascade' });
File.hasMany(Page, { onDelete: 'cascade' });
Folder.hasMany(File, { onDelete: 'cascade' });
User.belongsToMany(File, { through: FileAccess });

export { File, FileAccess, Folder, Page, User };
