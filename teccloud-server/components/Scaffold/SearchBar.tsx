import { useState } from 'react';
import styled from '@emotion/styled';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { OutlinedInputProps } from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

const StyledTextField = styled((props: TextFieldProps) => (
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
  folderId: number;
  onSearchQueryChanged: (query: string) => void;
}

const SearchBar = ({ folderId, onSearchQueryChanged }: SearchBarProps) => {
  const [value, setValue] = useState('');

  return (
    <StyledTextField
      color='info'
      placeholder='Search in your files...'
      variant='filled'
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSearchQueryChanged(value);
      }}
      InputProps={{
        endAdornment: (
          <IconButton
            sx={{ visibility: value ? 'visible' : 'hidden' }}
            onClick={() => setValue('')}
          >
            <ClearIcon />
          </IconButton>
        ),
      }}
    />
  );
};

export default SearchBar;
