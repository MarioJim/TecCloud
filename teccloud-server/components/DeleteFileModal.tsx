import { Dispatch, SetStateAction } from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { apiServer } from '../config';

export interface DeletingFile {
  fileName: string;
  originalName: string;
}

interface DeleteFileModalProps {
  file: DeletingFile | null;
  setFile: Dispatch<SetStateAction<DeletingFile | null>>;
}

const DeleteFileModal = ({ file, setFile }: DeleteFileModalProps) => {
  const handleClose = () => setFile(null);

  const deleteFile = async () => {
    if (!file) return;
    try {
      await fetch(`${apiServer}/files/${file.fileName}`, {
        method: 'delete',
        credentials: 'include',
      });
      location.assign('/files');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal open={file !== null} onClose={handleClose}>
      <Fade in={file !== null}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            border: '5px solid red',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant='h5' textAlign='center' fontWeight='bold'>
            Are you sure you want to permanently delete this file?
          </Typography>
          <Typography
            variant='h5'
            textAlign='center'
            fontStyle='italic'
            sx={{ my: 4 }}
            noWrap
            maxWidth='500px'
          >
            {file?.originalName || '.'}
          </Typography>
          <Stack
            direction='row'
            justifyContent='flex-start'
            alignItems='center'
            spacing={1}
          >
            <Button variant='contained' color='error' onClick={deleteFile}>
              Yes, delete now
            </Button>
            <Button variant='contained' color='primary' onClick={handleClose}>
              No, go back
            </Button>
          </Stack>
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeleteFileModal;
