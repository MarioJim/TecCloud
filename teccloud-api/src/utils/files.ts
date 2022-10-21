import path from 'path';

export const get_file_in_server_path = (fileId: string): string =>
  path.resolve(path.join(process.env.FILES_FOLDER as string, fileId));
