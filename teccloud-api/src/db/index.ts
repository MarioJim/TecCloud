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

User.hasOne(Folder);
Folder.belongsTo(User);

Folder.belongsTo(Folder);
Folder.hasMany(Folder);

Folder.hasMany(File);
File.belongsTo(Folder);

User.belongsToMany(File, { through: FileAccess });
File.belongsToMany(User, { through: FileAccess });

File.hasMany(Page);
Page.belongsTo(File);

export { File, FileAccess, Folder, Page, User };
