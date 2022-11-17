import { useState } from 'react';
import type { User } from '../../types';
import axios from 'axios';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import UndoIcon from '@mui/icons-material/Undo';
import WarningIcon from '@mui/icons-material/Warning';
import { apiServer } from '../../config';

interface UserAccessItemProps {
  fileName: string;
  user: User;
  setUsers: (users: User[]) => void;
  ownerId: number;
  currentUser: User;
}

const UserAccessItem = ({
  fileName,
  user,
  setUsers,
  ownerId,
  currentUser,
}: UserAccessItemProps) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const handleDelete = async () => {
    try {
      const response = await axios.post(
        `${apiServer}/files/unshareWithUser`,
        { filename: fileName, otherUsername: user.username },
        {
          withCredentials: true,
        },
      );

      setUsers(response.data.users);
    } catch (e: any) {
      console.error('Error sharing file:', e);
    }
  };

  return (
    <ListItem>
      <ListItemText
        primary={
          user.username === currentUser.username
            ? user.firstName + ' ' + user.lastName + ' (you)'
            : user.firstName + ' ' + user.lastName
        }
        secondary={
          user.id === ownerId ? user.username + ' (owner)' : user.username
        }
      />
      {ownerId === currentUser.id && user.id !== currentUser.id ? (
        showConfirmDelete ? (
          <>
            <Button
              variant='outlined'
              color='error'
              startIcon={<WarningIcon />}
              onClick={handleDelete}
              sx={{ marginRight: 1 }}
            >
              Yes?
            </Button>
            <Button
              variant='outlined'
              startIcon={<UndoIcon />}
              onClick={() => setShowConfirmDelete(false)}
            >
              No
            </Button>
          </>
        ) : (
          <Button
            variant='outlined'
            color='error'
            startIcon={<DeleteIcon />}
            onClick={() => setShowConfirmDelete(true)}
          >
            Delete
          </Button>
        )
      ) : (
        <></>
      )}
    </ListItem>
  );
};

export default UserAccessItem;
