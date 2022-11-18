import type { User } from '../types';
import { Dispatch, SetStateAction } from 'react';
import Box from '@mui/material/Box';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ShareDialog from './ShareDialog';
import { DeletingFile } from './DeleteFileModal';
import { apiServer } from '../config';

interface SingleFileProps {
  fileId: number;
  folderId: number;
  fileName: string;
  originalName: string;
  accessByLink: 'private' | 'public';
  users: User[];
  ownerId: number;
  currentUser: User;
  setAsDeletingFile?: Dispatch<SetStateAction<DeletingFile | null>>;
}

const SingleFile = ({
  fileId,
  folderId,
  fileName,
  originalName,
  accessByLink,
  users,
  ownerId,
  currentUser,
  setAsDeletingFile,
}: SingleFileProps) => (
  <Box
    sx={{
      height: '54px',
      borderTop: 1,
      borderBottom: 1,
      borderColor: 'primary.main',
      alignItems: 'center',
      margin: '5px',
    }}
  >
    <Stack
      direction='row'
      justifyContent='flex-start'
      alignItems='center'
      spacing={1}
    >
      <IconButton
        aria-label='download'
        size='large'
        target='_blank'
        href={`${apiServer}/files/download/${fileName}`}
      >
        <DownloadForOfflineIcon fontSize='inherit' />
      </IconButton>
      <Typography fontFamily={'Verdana'} noWrap sx={{ width: 0.6 }}>
        {originalName}
      </Typography>
      <Stack
        direction='row'
        justifyContent='flex-end'
        spacing={1}
        sx={{ width: 0.4 }}
      >
        <ShareDialog
          fileId={fileId}
          folderId={folderId}
          fileName={fileName}
          originalName={originalName}
          accessByLink={accessByLink}
          users={users}
          ownerId={ownerId}
          currentUser={currentUser}
        />
        {setAsDeletingFile && (
          <Button
            variant='contained'
            color='error'
            onClick={() => setAsDeletingFile({ fileName, originalName })}
          >
            Delete
          </Button>
        )}
      </Stack>
    </Stack>
  </Box>
);

export default SingleFile;
