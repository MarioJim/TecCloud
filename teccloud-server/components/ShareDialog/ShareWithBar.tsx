import { useState, ChangeEvent, FormEvent } from 'react';
import type { User } from '../../types';
import axios from 'axios';
import Button from '@mui/material/Button';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import { apiServer } from '../../config';

interface ShareWithBarProps {
  fileName: string;
  setUsers: (users: User[]) => void;
}

const ShareWithBar = ({ fileName, setUsers }: ShareWithBarProps) => {
  const [newUser, setNewUser] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [helperText, setHelperText] = useState<string>('');

  const handleChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setError(false);
    setHelperText('');
    setNewUser(event.target.value);
  };

  const handleShare = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${apiServer}/files/shareWithUser`,
        { filename: fileName, otherUsername: newUser },
        {
          withCredentials: true,
        },
      );

      setError(false);
      setHelperText('');
      setUsers(response.data.users);
    } catch (e: any) {
      setError(true);
      setHelperText(e.response.data.message);
      console.error('Error sharing file:', e);
    }
  };

  return (
    <form style={{ width: '100%' }} onSubmit={handleShare}>
      <FormControl
        error={error}
        fullWidth
        variant='filled'
        sx={{ marginBottom: 1 }}
      >
        <Stack direction='row' spacing={1}>
          <InputLabel htmlFor={'share-with-bar-' + { fileName }}>
            Share with
          </InputLabel>
          <FilledInput
            fullWidth
            placeholder='Write a username'
            value={newUser}
            onChange={handleChange}
          />
          <Button variant='contained' type='submit'>
            Share
          </Button>
        </Stack>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </form>
  );
};

export default ShareWithBar;
