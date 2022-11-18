import { useState } from 'react';
import { apiServer } from '../config';
import axios from 'axios';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import AlertTitle from '@mui/material/AlertTitle';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';

interface FolderModalProps {
  folderId: number;
  folderName: string;
  folders: any[];
  openRename: boolean;
  openDelete: boolean;
  setCurrentName: (folderName: any) => void;
  setFolders: (folder: any) => void;
  setOpenRename: (open: boolean) => void;
  setOpenDelete: (open: boolean) => void;
}

const FolderModal = ({
  folderId,
  folderName,
  folders,
  openRename,
  openDelete,
  setCurrentName,
  setFolders,
  setOpenRename,
  setOpenDelete,
}: FolderModalProps) => {
  const handleCloseRename = () => setTimeout(() => setOpenRename(false), 200);
  const handleCloseDelete = () => setTimeout(() => setOpenDelete(false), 200);
  const [error, setError] = useState<boolean>(false);

  const renameFolder = async (e: React.FormEvent): Promise<any> => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      newFolderName: { value: string };
    };

    try {
      await axios.put(
        `${apiServer}/folder/rename`,
        {
          folderId: folderId,
          folderName: folderName,
          newFolderName: target.newFolderName.value,
        },
        {
          withCredentials: true,
        },
      );
      setError(false);
      handleCloseRename();
      setCurrentName(target.newFolderName.value);
    } catch (err: any) {
      console.log(err);
      if (err.response.status === 401) {
        setError(true);
      }
    }
  };

  const deleteFolder = async () => {
    try {
      await fetch(`${apiServer}/folder/${folderId}`, {
        method: 'delete',
        credentials: 'include',
      });
      handleCloseDelete();
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
      <Button
        variant='contained'
        color='warning'
        onClick={() => setOpenRename(true)}
      >
        Rename
      </Button>
      <Modal open={openRename} onClose={handleCloseRename}>
        <Fade in={openRename} timeout={200}>
          <Box
            component='form'
            onSubmit={renameFolder}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '5px solid blue',
              boxShadow: 24,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant='h5' textAlign='center' fontWeight='bold'>
              What will be the new name?
            </Typography>
            <TextField
              required
              fullWidth
              name='newFolderName'
              id='newFolderName'
              sx={{ m: 2 }}
            />
            <Box sx={{ width: '100%' }}>
              <Collapse in={error}>
                <Alert severity='error' sx={{ mb: 2 }}>
                  <AlertTitle>Error</AlertTitle>
                  File name already exists in this folder!
                </Alert>
              </Collapse>
            </Box>
            <Stack
              direction='row'
              justifyContent='flex-start'
              alignItems='center'
              spacing={1}
            >
              <Button
                variant='contained'
                color='primary'
                onClick={handleCloseRename}
              >
                Go back
              </Button>
              <Button variant='contained' color='warning' type='submit'>
                Rename
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
      <Button
        variant='contained'
        color='error'
        onClick={() => setOpenDelete(true)}
      >
        Delete
      </Button>
      <Modal open={openDelete} onClose={handleCloseDelete}>
        <Fade in={openDelete}>
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
              <Button
                variant='contained'
                color='primary'
                onClick={handleCloseDelete}
              >
                No, go back
              </Button>
              <Button variant='contained' color='error' onClick={deleteFolder}>
                Yes, delete now
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default FolderModal;
