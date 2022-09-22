import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import SidebarItem from './SidebarItem';

const Sidebar = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: 240,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: {
        width: 240,
        boxSizing: 'border-box',
      },
    }}
  >
    <Toolbar />
    <Box sx={{ overflow: 'auto' }}>
      <List>
        <SidebarItem path="/files" title="My files" icon={<FolderIcon />} />
        <SidebarItem
          path="/shared"
          title="Shared with me"
          icon={<PeopleIcon />}
        />
      </List>
      <Divider />
      <List>
        <SidebarItem
          path="/settings"
          title="Settings"
          icon={<SettingsIcon />}
        />
      </List>
    </Box>
  </Drawer>
);

export default Sidebar;
