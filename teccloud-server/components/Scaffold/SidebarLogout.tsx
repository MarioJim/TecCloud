import React from 'react';
import Link from 'next/link';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';

const logout = () => {
  console.log('Clicking logout button!');
};

const SidebarLogout = () => {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={logout}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText
          primary='Logout'
          primaryTypographyProps={{
            fontWeight: 'regular',
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default SidebarLogout;
