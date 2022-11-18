import { useCallback, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import { useDropzone } from 'react-dropzone';
import UploadStatusDialog, { UploadStatus } from '../UploadStatusDialog';
import uploadCallback from '../../lib/uploadCallback';

interface SidebarUploadProps {
  folderId: number;
  folderFiles: any[];
  setFolderFiles: (files: any[]) => void;
  setReplaceFiles: (files: any[]) => void;
}

const SidebarUpload = ({
  folderId,
  folderFiles,
  setFolderFiles,
  setReplaceFiles,
}: SidebarUploadProps) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'initial',
  });

  const onDrop = useCallback(
    async (files: any[]) =>
      uploadCallback(
        folderId,
        folderFiles,
        setFolderFiles,
        setReplaceFiles,
        setUploadStatus,
      )(files),
    [folderId, folderFiles, setFolderFiles, setReplaceFiles],
  );

  const { getInputProps, getRootProps, open } = useDropzone({
    onDrop,
    noKeyboard: true,
    noClick: true,
  });

  return (
    <ListItem alignItems='center'>
      <UploadStatusDialog status={uploadStatus} setStatus={setUploadStatus} />
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Button
          variant='contained'
          size='large'
          startIcon={<CloudUploadIcon />}
          onClick={open}
        >
          Upload
        </Button>
      </div>
    </ListItem>
  );
};

export default SidebarUpload;
