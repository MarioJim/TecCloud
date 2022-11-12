import { useState } from 'react';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { apiServer } from '../../config';

interface UserAccessListProps {
  fileName: string;
}

const UserAccessList = ({ fileName }: UserAccessListProps) => {
  return (
    <List id={'user-access-list-' + { fileName }} sx={{ px: 1 }}>
      <ListItem>
        <ListItemText primary='First name Last Name' secondary='Username' />
        <Button variant='outlined' color='error' startIcon={<DeleteIcon />}>
          Delete
        </Button>
      </ListItem>
    </List>
  );
};

export default UserAccessList;
