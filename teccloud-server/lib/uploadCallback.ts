import axios from 'axios';
import { UploadStatus } from '../components/UploadStatusDialog';
import { apiServer } from '../config';

const uploadCallback = (
  folderId: number,
  folderFiles: any[],
  setFolderFiles: (files: any[]) => void,
  setReplaceFiles: (files: any[]) => void,
  setUploadStatus: (status: UploadStatus) => void,
) => {
  const onUploadProgress = (e: ProgressEvent) => {
    const percentage = (100 * e.loaded) / e.total;
    if (percentage < 100) {
      setUploadStatus({ status: 'progress', percentage });
    } else {
      setUploadStatus({ status: 'success' });
    }
  };

  return async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.set('folderId', `${folderId}`);

    const currentFiles = new Map<string, string>(
      folderFiles.map((file) => [file.originalName, file.fileName]),
    );

    const duplicates = acceptedFiles
      .map((file) => {
        if (currentFiles.has(file.name)) {
          return { prevFileName: currentFiles.get(file.name), replace: file };
        }
      })
      .filter((notUndefined) => notUndefined !== undefined);
    acceptedFiles.forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post(`${apiServer}/files/upload`, formData, {
        withCredentials: true,
        onUploadProgress,
      });

      setReplaceFiles([...duplicates]);
      setFolderFiles(response.data.files);
    } catch (e: any) {
      if (e.response.status === 413) {
        setUploadStatus({
          status: 'error',
          message:
            'Files were too large, try uploading files smaller than 10MB',
        });
      } else {
        setUploadStatus({
          status: 'error',
          message:
            'The server ran into an error while receiving your files, try again!',
        });
      }
      console.error('Error uploading files:', e);
    }
  };
};

export default uploadCallback;
