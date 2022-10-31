import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Sidebar from './Sidebar';
import { User } from '../../types';

interface ScaffoldProps {
  user: User;
  folderId?: number;
  children: React.ReactNode;
}

const Scaffold = ({ children, user, folderId }: ScaffoldProps) => (
  <Box sx={{ display: 'flex' }}>
    <AppBar
      position='fixed'
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant='h5' noWrap component='div'>
          TecCloud
        </Typography>

        <Typography variant='h6' noWrap component='div'>
          {user.username}
        </Typography>
      </Toolbar>
    </AppBar>
    <Sidebar folderId={folderId} />
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {children}
    </Box>
  </Box>
);

export default Scaffold;
