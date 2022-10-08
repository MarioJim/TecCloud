import Backdrop from '@mui/material/Backdrop';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';

interface UploadModalProps {
  open: boolean;
  numberFiles: number;
}

const UploadModal = ({ open, numberFiles }: UploadModalProps) => (
  <Modal
    open={open}
    closeAfterTransition
    sx={{ pointerEvents: 'none' }}
    BackdropComponent={Backdrop}
    BackdropProps={{ timeout: 500 }}
  >
    <Fade in={open}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '6px dashed blue',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant='h5'>
          {numberFiles === 1
            ? 'Drop that file here!'
            : `Drop those ${numberFiles} files here!`}
        </Typography>
        <Image
          src='/upload.gif'
          alt='Upload animation'
          width={300}
          height={200}
        />
      </Box>
    </Fade>
  </Modal>
);

export default UploadModal;
