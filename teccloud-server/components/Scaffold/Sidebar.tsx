import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import SidebarAddFolder from './SidebarAddFolder';
import SidebarItem from './SidebarItem';
import SidebarLogout from './SidebarLogout';
import SidebarUpload from './SidebarUpload';

interface SidebarProps {
  folderId?: number;
  folderFiles?: any[];
  setFolderFiles?: (files: any[]) => void;
  setReplaceFiles?: (files: any[]) => void;
  setFolders?: (folder: any) => void;
}

const Sidebar = ({
  folderId,
  folderFiles,
  setFolderFiles,
  setReplaceFiles,
  setFolders,
}: SidebarProps) => (
  <Drawer
    variant='permanent'
    sx={{
      width: 250,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: {
        width: 250,
        boxSizing: 'border-box',
      },
    }}
  >
    <Toolbar />
    <Box sx={{ overflow: 'auto' }}>
      {folderId !== undefined &&
        folderFiles !== undefined &&
        setFolderFiles !== undefined &&
        setReplaceFiles !== undefined &&
        setFolders !== undefined && (
          <List>
            <SidebarUpload
              folderId={folderId}
              folderFiles={folderFiles}
              setFolderFiles={setFolderFiles}
              setReplaceFiles={setReplaceFiles}
            />
            <SidebarAddFolder folderId={folderId} setFolders={setFolders} />
          </List>
        )}
      <Divider />
      <List>
        <SidebarItem
          path='/files'
          title='Files in my TecCloud'
          icon={<FolderIcon />}
        />
        <SidebarItem
          path='/shared'
          title='Shared with me'
          icon={<PeopleIcon />}
        />
      </List>
      <Divider />
      <List>
        <SidebarLogout />
      </List>
    </Box>
  </Drawer>
);

export default Sidebar;
