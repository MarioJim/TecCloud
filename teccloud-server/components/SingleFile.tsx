import Box from '@mui/material/Box';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteFileModal from './DeleteFileModal';
import { apiServer } from '../config';
import ShareDialog from './ShareDialog';

interface SingleFileProps {
  fileName: string;
  originalName: string;
}

const SingleFile = ({ fileName, originalName }: SingleFileProps) => (
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
        aria-label='delete'
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
        <ShareDialog fileName={fileName} originalName={originalName} />
        <DeleteFileModal fileName={fileName} originalName={originalName} />
      </Stack>
    </Stack>
  </Box>
);

export default SingleFile;
