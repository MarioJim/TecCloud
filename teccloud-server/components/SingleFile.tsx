import Box from '@mui/material/Box';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteFileModal from './DeleteFileModal';

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
        href={`http://localhost:3001/files/download/${fileName}`}
      >
        <DownloadForOfflineIcon fontSize='inherit' />
      </IconButton>
      <Typography fontFamily={'Verdana'} noWrap sx={{ width: 0.6 }}>
        {originalName}
      </Typography>
      <Stack direction='row' justifyContent='flex-end' sx={{ width: 0.4 }}>
        <DeleteFileModal fileName={fileName} originalName={originalName} />
      </Stack>
    </Stack>
  </Box>
);

export default SingleFile;
