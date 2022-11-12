import { useState } from 'react';
import Button from '@mui/material/Button';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import { apiServer } from '../../config';

interface ShareWithBarProps {
  fileName: string;
}

const ShareWithBar = ({ fileName }: ShareWithBarProps) => {
  return (
    <FormControl fullWidth variant='filled' sx={{ marginBottom: 1 }}>
      <Stack direction='row' spacing={1}>
        <InputLabel htmlFor={'share-with-bar-' + { fileName }}>
          Share with
        </InputLabel>
        <FilledInput fullWidth placeholder='Write a username' />
        <Button variant='contained'>Share</Button>
      </Stack>
    </FormControl>
  );
};

export default ShareWithBar;
