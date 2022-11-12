import { useState } from 'react';
import type { User } from '../../types';
import List from '@mui/material/List';
import UserAccessItem from './UserAccessItem';

interface UserAccessListProps {
  fileName: string;
  users: User[];
  setUsers: (users: User[]) => void;
  currentUser: User;
}

const UserAccessList = ({
  fileName,
  users,
  setUsers,
  currentUser,
}: UserAccessListProps) => {
  return (
    <List sx={{ px: 1 }}>
      {users.length > 0 ? (
        users.map((user) => (
          <UserAccessItem
            key={user.username}
            fileName={fileName}
            user={user}
            setUsers={setUsers}
            currentUser={currentUser}
          />
        ))
      ) : (
        <></>
      )}
    </List>
  );
};

export default UserAccessList;
