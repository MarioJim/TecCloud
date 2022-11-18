import type { User } from '../types';
import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import InsertDriveFileTwoToneIcon from '@mui/icons-material/InsertDriveFileTwoTone';
import FileModal from './FileModal';
import ShareDialog from './ShareDialog';
import { apiServer } from '../config';

interface ShareProperties {
  fileId: number;
  folderId: number;
  accessByLink: 'private' | 'public';
  users: User[];
  ownerId: number;
  currentUser: User;
}

interface SingleFileProps {
  fileName: string;
  originalName: string;
  thumbnail?: string;
  shareProps?: ShareProperties;
}

const SingleFile = ({
  fileName,
  originalName,
  thumbnail,
  shareProps,
}: SingleFileProps) => {
  const [currentName, setCurrentName] = useState<string>(originalName);

  return (
  <Card
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      margin: '8px',
      width: '270px',
    }}
  >
    {thumbnail ? (
      <CardMedia
        component='img'
        height='180'
        image={thumbnail}
        alt={`Thumbnail for file ${originalName}`}
        sx={{ objectPosition: 'top left' }}
      />
    ) : (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 180,
          fontSize: '72px',
        }}
      >
        <InsertDriveFileTwoToneIcon fontSize='inherit' color='primary' />
      </Box>
    )}
    <Divider />
    <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
      <Typography noWrap sx={{ flex: 1, marginLeft: '8px' }}>
        {currentName}
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <IconButton
          size='medium'
          target='_blank'
          href={`${apiServer}/files/download/${fileName}`}
        >
          <DownloadForOfflineIcon fontSize='inherit' />
        </IconButton>
        {shareProps && (
          <ShareDialog
            fileId={shareProps.fileId}
            folderId={shareProps.folderId}
            fileName={fileName}
            originalName={originalName}
            accessByLink={shareProps.accessByLink}
            users={shareProps.users}
            ownerId={shareProps.ownerId}
            currentUser={shareProps.currentUser}
          />
        )}
        {shareProps && shareProps.ownerId === shareProps.currentUser.id && (
            <FileModal
              folderId={shareProps.folderId}
              fileName={fileName}
              originalName={currentName}
              setCurrentName={setCurrentName}
            />
        )}
      </Box>
    </Box>
  </Card>
);

export default SingleFile;
