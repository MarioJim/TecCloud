import { useCallback, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import Fade from '@mui/material/Fade';
import ListItem from '@mui/material/ListItem';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { apiServer } from '../../config';

interface SidebarAddFolderProps {
  folderId: number;
  setFolders: (folder: any) => void;
}

const SidebarAddFolder = ({ folderId, setFolders }: SidebarAddFolderProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const handleClose = () => setOpen(false);

  const createFolder = async (e: React.FormEvent): Promise<any> => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      folderName: { value: string };
    };

    try {
      const response = await axios.post(
        `${apiServer}/folder/${folderId}`,
        { folderName: target.folderName.value },
        {
          withCredentials: true,
        },
      );
      setError(false);
      handleClose();
      setFolders(response.data.folder);
    } catch (err: any) {
      console.log(err);
      if (err.response.status === 401) {
        setError(true);
      }
    }
  };

  return (
    <ListItem alignItems='center'>
      <Button
        variant='outlined'
        size='large'
        startIcon={<CreateNewFolderIcon />}
        onClick={() => setOpen(true)}
      >
        Add Folder
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Fade in={open}>
          <Box
            component='form'
            onSubmit={createFolder}
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
              Name of folder:
            </Typography>
            <TextField
              required
              fullWidth
              name='folderName'
              id='folderName'
              sx={{ m: 2 }}
            />
            <Box sx={{ width: '100%' }}>
              <Collapse in={error}>
                <Alert severity='error' sx={{ mb: 2 }}>
                  <AlertTitle>Error</AlertTitle>
                  Folder name already exists!
                </Alert>
              </Collapse>
            </Box>
            <Stack
              direction='row'
              justifyContent='flex-start'
              alignItems='center'
              spacing={1}
            >
              <Button variant='contained' color='error' onClick={handleClose}>
                Cancel
              </Button>
              <Button variant='contained' color='primary' type='submit'>
                Create
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Modal>
    </ListItem>
  );
};

export default SidebarAddFolder;
