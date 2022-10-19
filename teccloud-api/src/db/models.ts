import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { sequelize } from './index';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare username: string;
  declare password: string;
  declare folderId: number;
  declare token: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  async generateToken(): Promise<string> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('No JWT Secret has been defined');
    }
    const token = jwt.sign({ id: this.id.toString() }, jwtSecret, {
      expiresIn: '10h',
    });
    this.token = token;
    await this.save();
    return token;
  }

  comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  static hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: true },
    folderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Folder,
        key: 'id',
      },
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'users',
    timestamps: true,
  },
);

export class File extends Model<
  InferAttributes<File>,
  InferCreationAttributes<File>
> {
  declare id: CreationOptional<number>;
  declare fileId: string;
  declare folderId: number;
  declare name: string;
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
    fileId: { type: DataTypes.STRING, allowNull: false },
    folderId: {
      type: DataTypes.INTEGER,
      references: {
        model: Folder,
        key: 'id',
      },
    },
    name: { type: DataTypes.STRING, allowNull: false },
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
    indexes: [{ fields: ['fileId'] }, { fields: ['folderId'] }],
  },
);

export class FileAccess extends Model<
  InferAttributes<FileAccess>,
  InferCreationAttributes<FileAccess>
> {
  declare id: CreationOptional<number>;
  declare fileId: string;
  declare userId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

FileAccess.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileId: {
      type: DataTypes.STRING,
      references: {
        model: File,
        key: 'id',
      },
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'file_access',
    timestamps: true,
    indexes: [{ fields: ['fileId', 'userId'] }],
  },
);

export class Page extends Model<
  InferAttributes<Page>,
  InferCreationAttributes<Page>
> {
  declare id: CreationOptional<number>;
  declare fileId: string;
  declare number: number;
  declare thumbnailPath: string;
  declare content: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Page.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileId: {
      type: DataTypes.STRING,
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'pages',
    timestamps: true,
  },
);
