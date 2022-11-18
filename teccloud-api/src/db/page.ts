import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import fs from 'fs/promises';
import { get_file_server_path } from '../utils/files';
import { sequelize, File } from './index';

export class Page extends Model<
  InferAttributes<Page>,
  InferCreationAttributes<Page>
> {
  declare id: CreationOptional<number>;
  declare fileId: number;
  declare number: number;
  declare thumbnailPath: string;
  declare content: string;

  async deleteOnServer(): Promise<void> {
    if (this.thumbnailPath) {
      const path = get_file_server_path(this.thumbnailPath);
      await fs.unlink(path);
    }
  }
}

Page.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileId: {
      type: DataTypes.INTEGER,
      references: {
        model: File,
        key: 'id',
      },
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    thumbnailPath: DataTypes.STRING,
    content: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'pages',
    timestamps: false,
  },
);
