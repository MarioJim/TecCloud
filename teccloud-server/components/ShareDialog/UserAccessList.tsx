import { useState } from 'react';
import type { User } from '../../types';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { apiServer } from '../../config';

interface UserAccessListProps {
  fileName: string;
  users: User[];
}

const UserAccessList = ({ fileName, users }: UserAccessListProps) => {
  return (
    <List sx={{ px: 1 }}>
      {users.length > 0 ? (
        users.map((user) => (
          <ListItem key={user.username}>
            <ListItemText
              primary={user.firstName + ' ' + user.lastName}
              secondary={user.username}
            />
            <Button variant='outlined' color='error' startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </ListItem>
        ))
      ) : (
        <></>
      )}
    </List>
  );
};

export default UserAccessList;
