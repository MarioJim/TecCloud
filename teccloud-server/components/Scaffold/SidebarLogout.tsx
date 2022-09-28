import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';

const SidebarLogout = () => {
  const logout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/user/logout', {
        method: 'post',
        credentials: 'include',
      });
      location.assign('/');
    } catch (err) {
      console.log(err);
    }
    document.cookie = 'authcookie=;expires=' + new Date().toUTCString();
  };

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
