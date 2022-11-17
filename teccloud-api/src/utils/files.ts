import path from 'path';
import { filesFolder } from '../config';

export const get_file_server_path = (fileName: string): string =>
  path.resolve(path.join(filesFolder, fileName));
