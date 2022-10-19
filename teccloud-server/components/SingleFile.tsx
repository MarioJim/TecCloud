import Box from '@mui/material/Box';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface SingleFileProps {
  fileId: number;
  fileName: string;
}

const SingleFile = ({ fileId, fileName }: SingleFileProps) => {
  return (
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
          href={`http://localhost:3001/files/download/${fileId}`}
        >
          <DownloadForOfflineIcon fontSize='inherit' />
        </IconButton>
        <Typography fontFamily={'Verdana'} noWrap>
          {fileName}
        </Typography>
      </Stack>
    </Box>
  );
};

export default SingleFile;
