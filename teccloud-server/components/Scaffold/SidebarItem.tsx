import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

interface SidebarItemProps {
  path: string;
  title: string;
  icon: React.ReactNode;
}

const SidebarItem = ({ path, title, icon }: SidebarItemProps) => {
  const { pathname } = useRouter();
  return (
    <ListItem disablePadding>
      <Link href={path} passHref>
        <ListItemButton selected={pathname === path}>
          <ListItemIcon>{icon}</ListItemIcon>
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              fontWeight: pathname === path ? 500 : 'regular',
            }}
          />
        </ListItemButton>
      </Link>
    </ListItem>
  );
};

export default SidebarItem;
