import { useState } from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { setFips } from 'crypto';

interface DeleteFolderModalProps {
  folderId: number;
  folderName: string;
  folders: any[];
  setFolders: (folder: any) => void;
}

const DeleteFolderModal = ({
  folderId,
  folderName,
  folders,
  setFolders,
}: DeleteFolderModalProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClose = () => setOpen(false);

  const deleteFolder = async () => {
    try {
      await fetch(`http://localhost:3001/folder/${folderId}`, {
        method: 'delete',
        credentials: 'include',
      });
      handleClose();
      const folderIndex = folders.findIndex(
        (folder: any) => folder.id === folderId,
      );
      if (folderIndex > -1) {
        setFolders(folders[folderIndex].id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Button variant='contained' color='error' onClick={() => setOpen(true)}>
        Delete
      </Button>
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
              border: '5px solid red',
              boxShadow: 24,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant='h5' textAlign='center' fontWeight='bold'>
              Are you sure you want to permanently delete this folder and its
              contents?
            </Typography>
            <Typography
              variant='h5'
              textAlign='center'
              fontStyle='italic'
              sx={{ my: 4 }}
            >
              {folderName}
            </Typography>
            <Stack
              direction='row'
              justifyContent='flex-start'
              alignItems='center'
              spacing={1}
            >
              <Button variant='contained' color='error' onClick={deleteFolder}>
                Yes, delete now
              </Button>
              <Button variant='contained' color='primary' onClick={handleClose}>
                No, go back
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default DeleteFolderModal;
