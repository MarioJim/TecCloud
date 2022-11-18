import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import InsertDriveFileTwoToneIcon from '@mui/icons-material/InsertDriveFileTwoTone';
import { apiServer } from '../config';

interface SinglePageProps {
  pageNum: number;
  fileName: string;
  originalName: string;
  thumbnail?: string;
}

const SinglePage = ({
  pageNum,
  fileName,
  originalName,
  thumbnail,
}: SinglePageProps) => (
  <Card
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      margin: '8px',
      width: '370px',
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
        {pageNum === 0 ? originalName : `Page ${pageNum} of ${originalName}`}
      </Typography>
      <IconButton
        size='medium'
        target='_blank'
        href={`${apiServer}/files/download/${fileName}`}
        sx={{ padding: '2px' }}
      >
        <DownloadForOfflineIcon fontSize='inherit' />
      </IconButton>
    </Box>
  </Card>
);

export default SinglePage;
