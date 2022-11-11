import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './teccloud.sqlite',
});

import { File } from './file';
import { FileAccess } from './fileaccess';
import { Folder } from './folder';
import { Page } from './page';
import { User } from './user';

User.hasOne(Folder);
Folder.hasOne(User);

Folder.belongsTo(Folder, { foreignKey: 'parentId' });
Folder.hasMany(Folder);

Folder.hasMany(File);
File.belongsTo(Folder);

User.belongsToMany(File, { through: FileAccess });
File.belongsToMany(User, { through: FileAccess });

File.hasMany(Page);
Page.belongsTo(File);

export { File, FileAccess, Folder, Page, User };
