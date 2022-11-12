import { useState } from 'react';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { apiServer } from '../../config';

interface GeneralAccessSelectProps {
  fileName: string;
}

const GeneralAccessSelect = ({ fileName }: GeneralAccessSelectProps) => {
  const [generalAccess, setGeneralAccess] = useState<string>('public');
  const handleChange = (event: SelectChangeEvent) => {
    setGeneralAccess(event.target.value);
  };

  return (
    <FormControl sx={{ minWidth: 120, paddingLeft: 1 }} size='small'>
      <InputLabel
        htmlFor={'general-access-select-' + { fileName }}
        sx={{ paddingLeft: 1 }}
      >
        Access
      </InputLabel>
      <Stack direction='row' spacing={1}>
        <Select
          labelId='demo-select-small'
          id={'general-access-select-' + { fileName }}
          value={generalAccess}
          label='Access'
          onChange={handleChange}
        >
          <MenuItem value={'public'}>Public</MenuItem>
          <MenuItem value={'private'}>Private</MenuItem>
        </Select>
        <Button>Apply</Button>
      </Stack>
    </FormControl>
  );
};

export default GeneralAccessSelect;
