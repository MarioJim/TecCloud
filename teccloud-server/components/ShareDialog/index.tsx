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
import ShareWithBar from './ShareWithBar';
import UserAccessList from './UserAccessList';
import GeneralAccessSelect from './GeneralAccessSelect';

interface ShareDialogProps {
  fileName: string;
  originalName: string;
  accessByLink: 'private' | 'public';
  users: User[];
  ownerId: number;
  currentUser: User;
}

const ShareDialog = ({
  fileName,
  originalName,
  accessByLink,
  users,
  ownerId,
  currentUser,
}: ShareDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClose = () => setOpen(false);

  const [usersList, setUsersList] = useState<User[]>(users);

  return (
    <>
      <Button variant='contained' color='info' onClick={() => setOpen(true)}>
        {ownerId === currentUser.id ? <>Share</> : <>Shared with</>}
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {ownerId == currentUser.id ? (
            <>Share &quot;{originalName}&quot;</>
          ) : (
            <>Shared file: &quot;{originalName}&quot;</>
          )}
        </DialogTitle>
        <DialogContent>
          <Stack
            justifyContent='flex-start'
            alignItems='flex-start'
            spacing={1}
          >
            {ownerId === currentUser.id ? (
              <ShareWithBar
                fileName={fileName}
                setUsers={(newUsers: User[]) => setUsersList(newUsers)}
              />
            ) : (
              <></>
            )}
            <Box
              sx={{
                width: '100%',
              }}
            >
              <Typography sx={{ px: 1, fontWeight: 'bold' }}>
                Who has access
              </Typography>
              <UserAccessList
                fileName={fileName}
                users={usersList}
                setUsers={(newUsers: User[]) => setUsersList(newUsers)}
                ownerId={ownerId}
                currentUser={currentUser}
              />
            </Box>
            {ownerId == currentUser.id ? (
              <>
                <Typography sx={{ px: 1, fontWeight: 'bold' }}>
                  General access
                </Typography>
                <GeneralAccessSelect
                  fileName={fileName}
                  accessByLink={accessByLink}
                />
              </>
            ) : (
              <></>
            )}
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
