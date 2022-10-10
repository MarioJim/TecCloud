import { useCallback, useState } from 'react';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import { useDropzone } from 'react-dropzone';
import UploadStatusDialog, { UploadStatus } from '../UploadStatusDialog';
import { apiServer } from '../../config';

interface SidebarUploadProps {
  folderId: number;
  folderFiles: any[];
  setFolderFiles: (files: any[]) => void;
  setReplaceFiles: (files: any[]) => void;
}

const SidebarUpload = ({
  folderId,
  folderFiles,
  setFolderFiles,
  setReplaceFiles,
}: SidebarUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'initial',
  });

  const onUploadProgress = useCallback((e: ProgressEvent) => {
    const percentage = (100 * e.loaded) / e.total;
    if (percentage < 100) {
      setUploadStatus({ status: 'progress', percentage });
    } else {
      setUploadStatus({ status: 'success' });
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
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
        const response = await axios.post(
          `${apiServer}/files/upload`,
          formData,
          {
            withCredentials: true,
            onUploadProgress,
          },
        );

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
    },
    [onUploadProgress, folderId, folderFiles, setFolderFiles, setReplaceFiles],
  );

  const { getInputProps, getRootProps, open } = useDropzone({
    onDrop,
    noKeyboard: true,
    noClick: true,
  });

  return (
    <ListItem alignItems='center'>
      <UploadStatusDialog status={uploadStatus} setStatus={setUploadStatus} />
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Button
          variant='contained'
          size='large'
          startIcon={<CloudUploadIcon />}
          onClick={open}
        >
          Upload
        </Button>
      </div>
    </ListItem>
  );
};

export default SidebarUpload;
