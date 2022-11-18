import { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { apiServer } from '../config';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

interface FileModalProps {
  folderId: number;
  fileName: string;
  originalName: string;
  setCurrentName: (fileName: any) => void;
}

const FileModal = ({
  folderId,
  fileName,
  originalName,
  setCurrentName,
}: FileModalProps) => {
  const [openRename, setOpenRename] = useState<boolean>(false);
  const handleCloseRename = () => setOpenRename(false);
  const [error, setError] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const handleCloseDelete = () => setOpenDelete(false);

  const renameFile = async (e: React.FormEvent): Promise<any> => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      newFileName: { value: string };
    };

    try {
      const response = await axios.put(
        `${apiServer}/files/rename`,
        {
          folderId: folderId,
          fileName: fileName,
          originalName: originalName,
          newFileName: target.newFileName.value,
        },
        {
          withCredentials: true,
        },
      );
      setError(false);
      handleCloseRename();
      setCurrentName(response.data.updatedFileName);
    } catch (err: any) {
      console.log(err);
      if (err.response.status === 401) {
        setError(true);
      }
    }
  };

  const deleteFile = async () => {
    try {
      await fetch(`${apiServer}/files/${fileName}`, {
        method: 'delete',
        credentials: 'include',
      });
      location.assign('/files');
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
        <Fade in={openRename}>
          <Box
            component='form'
            onSubmit={renameFile}
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
              name='newFileName'
              id='newFileName'
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
              Are you sure you want to permanently delete this file?
            </Typography>
            <Typography
              variant='h5'
              textAlign='center'
              fontStyle='italic'
              sx={{ my: 4 }}
            >
              {originalName}
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
              <Button variant='contained' color='error' onClick={deleteFile}>
                Yes, delete now
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default FileModal;
