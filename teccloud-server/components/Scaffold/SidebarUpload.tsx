import { useCallback, useState } from 'react';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import UploadStatusDialog, { UploadStatus } from '../UploadStatusDialog';
import { useDropzone } from 'react-dropzone';

interface SidebarUploadProps {
  folderId: number;
  folderFiles: any[];
  setFolderFiles: (files: any[]) => void;
}

const SidebarUpload = ({
  folderId,
  folderFiles,
  setFolderFiles,
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

      const duplicatesFiles = folderFiles;
      const duplicatesNames = new Set<string>();
      duplicatesFiles.forEach((file) => duplicatesNames.add(file.originalName));

      acceptedFiles = acceptedFiles.filter(
        (file) => !duplicatesNames.has(file.name),
      );
      acceptedFiles.forEach((file) => formData.append('files', file));

      try {
        const response = await axios.post(
          'http://localhost:3001/files/upload',
          formData,
          {
            withCredentials: true,
            onUploadProgress,
          },
        );

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
    [onUploadProgress, folderId, folderFiles],
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
