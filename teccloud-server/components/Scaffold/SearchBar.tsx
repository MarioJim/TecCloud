import TextField, { TextFieldProps } from '@mui/material/TextField';
import styled from '@emotion/styled';
import { useState } from 'react';
import { OutlinedInputProps } from '@mui/material/OutlinedInput';

const RedditTextField = styled((props: TextFieldProps) => (
  <TextField
    InputProps={{ disableUnderline: true } as Partial<OutlinedInputProps>}
    {...props}
  />
))(() => ({
  '& .MuiFilledInput-root': {
    border: '1px solid white',
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: 'transparent',
    '&:hover': {
      border: '2px solid white',
      backgroundColor: '#ffffff55',
    },
    '&.Mui-focused': {
      border: '2px solid white',
      backgroundColor: '#ffffffaa',
    },
    '& .MuiInputBase-input': {
      padding: '10px 14px',
    },
  },
}));
interface SearchBarProps {
  folderId?: number;
}

const SearchBar = ({ folderId }: SearchBarProps) => {
  const [value, setValue] = useState('');
  console.log(`Should search for ${value} in folder ${folderId}`);

  return (
    <RedditTextField
      color='info'
      placeholder='Search in your files...'
      variant='filled'
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default SearchBar;
