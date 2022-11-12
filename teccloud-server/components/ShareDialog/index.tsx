import { useState } from 'react';
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
  fileName: string;
  originalName: string;
}

const ShareDialog = ({ fileName, originalName }: ShareDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button variant='contained' color='info' onClick={() => setOpen(true)}>
        Share
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle id='share-dialog-title' sx={{ fontWeight: 'bold' }}>
          Share "{originalName}"
        </DialogTitle>
        <DialogContent id='share-dialog-description'>
          <Stack
            justifyContent='flex-start'
            alignItems='flex-start'
            spacing={1}
          >
            <ShareWithBar fileName={fileName} />
            <Box
              sx={{
                width: '100%',
              }}
            >
              <Typography sx={{ px: 1, fontWeight: 'bold' }}>
                Who has access
              </Typography>
              <UserAccessList fileName={fileName} />
            </Box>
            <Typography sx={{ px: 1, fontWeight: 'bold' }}>
              General access
            </Typography>
            <GeneralAccessSelect fileName={fileName} />
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
