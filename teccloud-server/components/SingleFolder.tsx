import Box from '@mui/material/Box';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteFileModal from './DeleteFileModal';

interface SingleFolderProps {
  folderName: string;
}

const SingleFolder = ({ folderName }: SingleFolderProps) => (
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
      <Typography fontFamily={'Verdana'} noWrap sx={{ width: 0.6 }}>
        {folderName}
      </Typography>
    </Stack>
  </Box>
);

export default SingleFolder;
