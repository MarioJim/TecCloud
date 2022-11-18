import { blue } from '@mui/material/colors';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import DeleteFolderModal from './DeleteFolderModal';

interface SingleFolderProps {
  folderId: number;
  folderName: string;
  folders: any[];
  setFolders: (folder: any) => void;
}

const useOutsideClick = (callback: any) => {
  const ref = useRef<any>();

  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [ref]);

  return ref;
};

const SingleFolder = ({
  folderId,
  folderName,
  folders,
  setFolders,
}: SingleFolderProps) => {
  const [folderColor, setFolderColor] = useState<any>(blue[50]);

  const handleClickOutside = () => {
    setFolderColor(blue[50]);
  };

  const ref = useOutsideClick(handleClickOutside);

  const handleClick = (e: any) => {
    if (e.detail === 1) {
      setFolderColor(blue[100]);
    }
    if (e.detail > 1) {
      location.assign(`/files/${folderId}`);
    }
  };

  return (
    <Box
      ref={ref}
      sx={{
        height: '54px',
        borderTop: 1,
        borderBottom: 1,
        backgroundColor: folderColor,
        borderColor: 'primary.main',
        alignItems: 'center',
        margin: '5px',
      }}
      onClick={handleClick}
    >
      <Stack
        direction='row'
        justifyContent='flex-start'
        alignItems='center'
        spacing={1}
      >
        <IconButton
          size='large'
          href={`http://localhost:3000/files/${folderId}`}
        >
          <FolderIcon fontSize='inherit' />
        </IconButton>
        <Typography fontFamily={'Verdana'} noWrap sx={{ width: 0.6 }}>
          {folderName}
        </Typography>
        <Stack
          direction='row'
          justifyContent='flex-end'
          sx={{ width: 0.4, paddingRight: 2 }}
        >
          <DeleteFolderModal
            folderId={folderId}
            folderName={folderName}
            folders={folders}
            setFolders={setFolders}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default SingleFolder;
