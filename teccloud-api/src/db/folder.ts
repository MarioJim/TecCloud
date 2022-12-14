import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize, User, File } from './index';

export class Folder extends Model<
  InferAttributes<Folder>,
  InferCreationAttributes<Folder>
> {
  declare id: CreationOptional<number>;
  declare parentId: number | null;
  declare name: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  async isOwnedBy(user: User): Promise<boolean> {
    if (user.folderId === this.id || user.folderId === this.parentId) {
      return true;
    }
    if (this.parentId === null) {
      return false;
    }
    const parentFolder = await Folder.findByPk(this.parentId);
    return parentFolder?.isOwnedBy(user) || false;
  }

  async deleteOnServer(): Promise<void> {
    let files: any[] = [];
    try {
      files = await File.findAll({ where: { folderId: this.id } });
    } catch (error) {
      console.error(error);
    }

    let folders: any[] = [];
    try {
      folders = await Folder.findAll({ where: { parentId: this.id } });
    } catch (error) {
      console.error(error);
    }

    await Promise.allSettled([
      ...files.map((file) => file.deleteOnServer()),
      ...folders.map((folder) => folder.deleteOnServer()),
    ]);
  }
}

Folder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parentId: {
      type: DataTypes.INTEGER,
      references: {
        model: Folder,
        key: 'id',
      },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'folders',
    timestamps: true,
  },
);
