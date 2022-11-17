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
Folder.hasOne(User);

Folder.belongsTo(Folder, { foreignKey: 'parentId', onDelete: 'cascade' });
Folder.hasMany(Folder, { onDelete: 'cascade' });

Folder.hasMany(File, { onDelete: 'cascade' });
File.belongsTo(Folder, { onDelete: 'cascade' });

User.belongsToMany(File, { through: FileAccess });
File.belongsToMany(User, { through: FileAccess });

File.hasMany(Page, { onDelete: 'cascade' });
Page.belongsTo(File, { onDelete: 'cascade' });

export { File, FileAccess, Folder, Page, User };
