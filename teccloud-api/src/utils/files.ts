import path from 'path';

export const get_file_server_path = (fileName: string): string =>
  path.resolve(path.join(process.env.FILES_FOLDER as string, fileName));
