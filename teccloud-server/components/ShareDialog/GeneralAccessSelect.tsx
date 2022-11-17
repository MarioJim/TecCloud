import { useState } from 'react';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import { apiServer } from '../../config';

interface GeneralAccessSelectProps {
  fileName: string;
  accessByLink: 'public' | 'private';
}

const GeneralAccessSelect = ({
  fileName,
  accessByLink,
}: GeneralAccessSelectProps) => {
  const [generalAccess, setGeneralAccess] = useState<string>(accessByLink);
  const handleChange = (event: SelectChangeEvent) => {
    setGeneralAccess(event.target.value);
    setErrorAlert(false);
    setSuccessAlert(false);
  };

  const [successAlert, setSuccessAlert] = useState<boolean>(false);
  const [errorAlert, setErrorAlert] = useState<boolean>(false);
  const handleApply = async () => {
    try {
      await axios.post(
        `${apiServer}/files/changeAccess/${fileName}`,
        { generalAccess: generalAccess },
        {
          withCredentials: true,
        },
      );

      if (generalAccess === 'public') {
        navigator.clipboard.writeText(
          `${apiServer}/files/download/${fileName}`,
        );
      }

      setSuccessAlert(true);
      setErrorAlert(false);
    } catch (e: any) {
      setSuccessAlert(false);
      setErrorAlert(true);
      console.error('Error changing access:', e);
    }
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
          id={'general-access-select-' + { fileName }}
          value={generalAccess}
          label='Access'
          onChange={handleChange}
        >
          <MenuItem value={'public'}>Public</MenuItem>
          <MenuItem value={'private'}>Private</MenuItem>
        </Select>
        <Button onClick={handleApply}>Apply</Button>
        {successAlert ? (
          <Alert
            onClose={() => {
              setSuccessAlert(false);
            }}
          >
            {generalAccess === 'public' ? 'Link copied to clipboard!' : 'Done!'}
          </Alert>
        ) : (
          <></>
        )}
        {errorAlert ? (
          <Alert
            severity='error'
            onClose={() => {
              setErrorAlert(false);
            }}
          >
            Error. Try again.
          </Alert>
        ) : (
          <></>
        )}
      </Stack>
    </FormControl>
  );
};

export default GeneralAccessSelect;
