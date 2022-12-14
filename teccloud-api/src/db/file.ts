import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
} from 'sequelize';
import fs from 'fs/promises';
import { get_file_server_path } from '../utils/files';
import { sequelize, Folder, User, FileAccess, Page } from './index';

export class File extends Model<
  InferAttributes<File>,
  InferCreationAttributes<File>
> {
  declare id: CreationOptional<number>;
  declare folderId: number;
  declare fileName: string;
  declare originalName: string;
  declare size: number;
  declare fileType: string;
  declare accessByLink: CreationOptional<'private' | 'public'>;
  declare lastViewed: CreationOptional<Date>;
  declare timesViewed: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare addUser: BelongsToManyAddAssociationMixin<User, number>;
  declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;

  async accessableBy(user: User): Promise<boolean> {
    return (await this.ownedBy(user)) || (await this.viewableBy(user));
  }

  async ownedBy(user: User): Promise<boolean> {
    const folder = await Folder.findByPk(this.folderId);
    return folder?.isOwnedBy(user) || false;
  }

  async viewableBy(user: User): Promise<boolean> {
    if (this.accessByLink === 'public') {
      return true;
    }
    const access = await FileAccess.findOne({
      where: { fileId: this.id, userId: user.id },
    });
    return access !== null;
  }

  async deleteOnServer(): Promise<void> {
    const path = get_file_server_path(this.fileName);
    let pages: any[] = [];
    try {
      pages = await Page.findAll({ where: { fileId: this.id } });
    } catch (error) {
      console.error(error);
    }

    await Promise.allSettled([
      fs.unlink(path),
      ...pages.map((page) => page.deleteOnServer()),
    ]);
  }
}

File.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    folderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Folder,
        key: 'id',
      },
    },
    fileName: { type: DataTypes.STRING, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fileType: { type: DataTypes.STRING, allowNull: false },
    accessByLink: {
      type: DataTypes.ENUM,
      values: ['private', 'public'],
      defaultValue: 'private',
      allowNull: false,
    },
    lastViewed: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    timesViewed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'files',
    timestamps: true,
    indexes: [{ fields: ['fileName'] }, { fields: ['folderId'] }],
  },
);
