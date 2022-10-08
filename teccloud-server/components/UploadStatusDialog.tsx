import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
import { Dispatch, SetStateAction } from 'react';

export type UploadStatus =
  | { status: 'initial' }
  | { status: 'error'; message: string }
  | { status: 'success' }
  | { status: 'progress'; percentage: number };

interface UploadStatusDialogProps {
  status: UploadStatus;
  setStatus: Dispatch<SetStateAction<UploadStatus>>;
}

const UploadStatusDialog = ({ status, setStatus }: UploadStatusDialogProps) => {
  const close = () => setStatus({ status: 'initial' });

  if (status.status === 'error') {
    return (
      <Snackbar
        open
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={12000}
      >
        <Alert severity='error' onClose={close}>
          <AlertTitle>Error uploading files</AlertTitle>
          {status.message}
        </Alert>
      </Snackbar>
    );
  }

  if (status.status === 'success') {
    return (
      <Snackbar
        open
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={6000}
      >
        <Alert severity='success' onClose={close}>
          <AlertTitle>Success</AlertTitle>
          Files uploaded correctly
        </Alert>
      </Snackbar>
    );
  }

  if (status.status === 'progress') {
    return (
      <Snackbar
        open
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity='info' onClose={close}>
          <AlertTitle>Uploading...</AlertTitle>
          Upload progress: {Math.round(status.percentage)}%
        </Alert>
      </Snackbar>
    );
  }

  return <></>;
};

export default UploadStatusDialog;
