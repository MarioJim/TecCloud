import { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

interface ReplaceFileModalProps {
  folderId: number;
  prevFileName: string;
  newFile: File;
  removeFile: (fileOriginalName: string) => void;
  setFolderFiles: (file: any[]) => void;
}

const ReplaceFileModal = ({
  folderId,
  prevFileName,
  newFile,
  removeFile,
  setFolderFiles,
}: ReplaceFileModalProps) => {
  const [open, setOpen] = useState<boolean>(true);
  const handleClose = () => {
    removeFile(newFile.name);
    setOpen(false);
  };

  const replaceFile = async () => {
    try {
      const formData = new FormData();
      formData.set('folderId', `${folderId}`);
      formData.append('files', newFile);

      await axios.delete(`http://localhost:3001/files/${prevFileName}`, {
        withCredentials: true,
      });
      await axios.post('http://localhost:3001/files/upload', formData, {
        withCredentials: true,
      });

      const response = await axios.get(
        `http://localhost:3001/files/${folderId}`,
        {
          withCredentials: true,
        },
      );

      removeFile(newFile.name);
      setFolderFiles(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '5px solid yellow',
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant='h5' textAlign='center' fontWeight='bold'>
            Are you sure you want to replace this file?
          </Typography>
          <Typography
            variant='h5'
            textAlign='center'
            fontStyle='italic'
            sx={{ my: 4 }}
          >
            {newFile.name}
          </Typography>
          <Stack
            direction='row'
            justifyContent='flex-start'
            alignItems='center'
            spacing={1}
          >
            <Button variant='contained' color='warning' onClick={replaceFile}>
              Yes, replace with new one
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

export default ReplaceFileModal;
