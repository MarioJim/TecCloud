import type { GetServerSideUser, AuthenticatedPage, User } from '../types';
import axios from 'axios';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import Scaffold from '../components/Scaffold';
import UploadModal from '../components/UploadModal';
import UploadStatusDialog, {
  UploadStatus,
} from '../components/UploadStatusDialog';
import SingleFile from '../components/SingleFile';

export const getServerSideProps: GetServerSideUser = async (ctx) => {
  const res = await fetch('http://localhost:3001/user/auth', {
    credentials: 'include',
    headers: ctx.req.headers as HeadersInit,
  });
  if (res.status === 201) {
    const body = await res.json();
    return {
      props: {
        user: body.user as User,
      },
    };
  }
  return {
    redirect: {
      permanent: false,
      destination: '/login',
    },
  };
};

const Files: AuthenticatedPage = ({ user }) => {
  const [numberDraggedFiles, setNumberDraggedFiles] = useState<number>(0);
  const [folderFiles, setFolderFiles] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'initial',
  });

  useEffect(() => {
    const fetchFiles = async () => {
      const filesResponse = await fetch(
        `http://localhost:3001/files/${user.folderId}`,
        {
          method: 'get',
          credentials: 'include',
        },
      );
      const filesJson = await filesResponse.json();
      setFolderFiles(filesJson);
    };

    fetchFiles().catch(console.error);
  });

  const onUploadProgress = useCallback((e: ProgressEvent) => {
    const percentage = (100 * e.loaded) / e.total;
    if (percentage < 100) {
      setUploadStatus({ status: 'progress', percentage });
    } else {
      setUploadStatus({ status: 'success' });
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const formData = new FormData();
      formData.set('folderId', `${user.folderId}`);
      acceptedFiles.forEach((file) => formData.append('files', file));

      try {
        await axios.post('http://localhost:3001/files/upload', formData, {
          withCredentials: true,
          onUploadProgress,
        });
        location.assign('/files');
      } catch (e: any) {
        if (e.response.status === 413) {
          setUploadStatus({
            status: 'error',
            message:
              'Files were too large, try uploading files smaller than 10MB',
          });
        } else {
          setUploadStatus({
            status: 'error',
            message:
              'The server ran into an error while receiving your files, try again!',
          });
        }
        console.error('Error uploading files:', e);
      }
    },
    [onUploadProgress, user.folderId],
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: (e) =>
      setNumberDraggedFiles(e.dataTransfer?.items.length || 0),
    noKeyboard: true,
    noClick: true,
  });

  return (
    <Fragment>
      <Head>
        <title>Files - TecCloud</title>
      </Head>
      <Scaffold user={user} folderId={user.folderId}>
        <UploadModal open={isDragActive} numberFiles={numberDraggedFiles} />
        <UploadStatusDialog status={uploadStatus} setStatus={setUploadStatus} />
        <Box
          sx={{
            maxWidth: 'calc(100vw - 300px)',
            minHeight: 'calc(100vh - 112px)',
          }}
          {...getRootProps()}
        >
          {folderFiles.length == 0 ? (
            <>
              <Typography paragraph>
                Oops...you don&apos;t have any files yet.
              </Typography>
              <input {...getInputProps()} />
              <Typography paragraph>
                Drop a file here, or click to select a file to upload!
              </Typography>
            </>
          ) : (
            folderFiles.map((file) => (
              <SingleFile
                key={file.id}
                fileName={file.fileName}
                originalName={file.originalName}
              />
            ))
          )}
        </Box>
      </Scaffold>
    </Fragment>
  );
};

export default Files;
