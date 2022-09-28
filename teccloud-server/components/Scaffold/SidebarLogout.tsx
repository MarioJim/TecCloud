import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';

const SidebarLogout = () => {
  const logout: (e: React.FormEvent) => void = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/user/logout', {
        method: 'post',
        credentials: 'include',
      });
      sessionStorage.removeItem('user');
      location.assign('/');
    } catch (err) {
      console.log(err);
    }
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
