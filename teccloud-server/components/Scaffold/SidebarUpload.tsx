import type { AuthenticatedPage, User } from '../../types';
import React from 'react';
import { useCallback, useState } from 'react';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import Files from '../../pages/files';
import ListItem from '@mui/material/ListItem';
import UploadStatusDialog, { UploadStatus } from '../UploadStatusDialog';
import { useDropzone } from 'react-dropzone';

const SidebarUpload: AuthenticatedPage = ({ user }) => {
  const [lastFilesDropped, setLastFilesDropped] = useState<any[]>([]);
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
      formData.set('folderId', `1`);
      acceptedFiles.forEach((file) => formData.append('files', file));

      try {
        const response = await axios.post(
          'http://localhost:3001/files/upload',
          formData,
          { withCredentials: true, onUploadProgress },
        );
        setLastFilesDropped(response.data.files);
        location.assign('/files');
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
    [onUploadProgress, /*user.folderId=*/ 1],
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
