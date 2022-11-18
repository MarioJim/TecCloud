import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import { User } from '../../types';

interface ScaffoldProps {
  children: React.ReactNode;
  user: User;
  folderId?: number;
  folderFiles?: any[];
  setFolderFiles?: (files: any[]) => void;
  setReplaceFiles?: (files: any[]) => void;
  setFolders?: (folder: any) => void;
  onSearchQueryChanged?: (query: string) => void;
}

const Scaffold = ({
  children,
  user,
  folderId,
  folderFiles,
  setFolderFiles,
  setReplaceFiles,
  setFolders,
  onSearchQueryChanged,
}: ScaffoldProps) => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppBar
      position='fixed'
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant='h5' noWrap component='div'>
          TecCloud
        </Typography>

        {onSearchQueryChanged !== undefined && (
          <SearchBar onSearchQueryChanged={onSearchQueryChanged} />
        )}

        <Typography variant='h6' noWrap component='div'>
          {user.username}
        </Typography>
      </Toolbar>
    </AppBar>
    <Sidebar
      folderId={folderId}
      folderFiles={folderFiles}
      setFolderFiles={setFolderFiles}
      setReplaceFiles={setReplaceFiles}
      setFolders={setFolders}
    />
    <Box
      component='main'
      sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}
    >
      <Toolbar />
      {children}
    </Box>
  </Box>
);

export default Scaffold;
