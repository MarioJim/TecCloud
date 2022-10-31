import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize, Folder, User, FileAccess } from './index';

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

  async accessableBy(userId: number): Promise<boolean> {
    if (this.accessByLink === 'public') {
      return true;
    }
    const user = await User.findByPk(userId);
    const folder = await Folder.findByPk(this.folderId);
    if ((user && folder?.isOwnedBy(user)) || false) {
      return true;
    }
    const access = await FileAccess.findOne({
      where: { fileId: this.id, userId },
    });
    return access !== null;
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
