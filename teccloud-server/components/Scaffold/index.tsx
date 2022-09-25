import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Sidebar from './Sidebar';

interface ScaffoldProps {
  children: React.ReactNode;
}

const Scaffold = ({ children }: ScaffoldProps) => (
  <Box sx={{ display: 'flex' }}>
    <AppBar
      position='fixed'
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography variant='h6' noWrap component='div'>
          TecCloud
        </Typography>
      </Toolbar>
    </AppBar>
    <Sidebar />
    <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
      <Toolbar />
      {children}
    </Box>
  </Box>
);

export default Scaffold;
