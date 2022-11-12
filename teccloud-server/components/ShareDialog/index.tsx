import { useState } from 'react';
import type { User } from '../../types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { apiServer } from '../../config';
import ShareWithBar from './ShareWithBar';
import UserAccessList from './UserAccessList';
import GeneralAccessSelect from './GeneralAccessSelect';

interface ShareDialogProps {
  fileId: number;
  folderId: number;
  fileName: string;
  originalName: string;
  accessByLink: 'private' | 'public';
  users: User[];
}

const ShareDialog = ({
  fileId,
  folderId,
  fileName,
  originalName,
  accessByLink,
  users,
}: ShareDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClose = () => setOpen(false);

  const [usersList, setUsersList] = useState<User[]>(users);

  return (
    <>
      <Button variant='contained' color='info' onClick={() => setOpen(true)}>
        Share
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Share "{originalName}"
        </DialogTitle>
        <DialogContent>
          <Stack
            justifyContent='flex-start'
            alignItems='flex-start'
            spacing={1}
          >
            <ShareWithBar
              fileName={fileName}
              setUsers={(newUsers: User[]) => setUsersList(newUsers)}
            />
            <Box
              sx={{
                width: '100%',
              }}
            >
              <Typography sx={{ px: 1, fontWeight: 'bold' }}>
                Who has access
              </Typography>
              <UserAccessList fileName={fileName} users={usersList} />
            </Box>
            <Typography sx={{ px: 1, fontWeight: 'bold' }}>
              General access
            </Typography>
            <GeneralAccessSelect
              fileName={fileName}
              accessByLink={accessByLink}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ marginRight: 2, marginBottom: 1 }}>
          <Button variant='contained' color='secondary' onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShareDialog;
