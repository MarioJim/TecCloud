import { blue, blueGrey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import FolderModal from './FolderModal';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';

interface SingleFolderProps {
  folderId: number;
  folderName: string;
  folders: any[];
  setFolders: (folder: any) => void;
}

const useOutsideClick = (callback: () => void) => {
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
  }, [ref, callback]);

  return ref;
};

const SingleFolder = ({
  folderId,
  folderName,
  folders,
  setFolders,
}: SingleFolderProps) => {
  const [currentName, setCurrentName] = useState<string>(folderName);
  const [folderColor, setFolderColor] = useState<string>(blueGrey[50]);
  const [openRename, setOpenRename] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const ref = useOutsideClick(() => setFolderColor(blueGrey[50]));

  return (
    <Card
      ref={ref}
      onClick={(e) => {
        if (openRename || openDelete) return;
        if (e.detail === 1) setFolderColor(blue[100]);
        if (e.detail > 1) location.assign(`/files/${folderId}`);
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        margin: '8px',
        width: '270px',
        backgroundColor: folderColor,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 180,
          fontSize: '72px',
        }}
      >
        <FolderIcon fontSize='inherit' color='primary' />
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
        <Typography noWrap sx={{ flex: 1, marginLeft: '8px' }}>
          {currentName}
        </Typography>
        <FolderModal
          folderId={folderId}
          folderName={folderName}
          folders={folders}
          openRename={openRename}
          openDelete={openDelete}
          setCurrentName={setCurrentName}
          setFolders={setFolders}
          setOpenRename={setOpenRename}
          setOpenDelete={setOpenDelete}
        />
      </Box>
    </Card>
  );
};

export default SingleFolder;
