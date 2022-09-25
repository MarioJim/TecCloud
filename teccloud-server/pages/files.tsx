import type { NextPage } from 'next';
import { Fragment, useCallback, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import Scaffold from '../components/Scaffold';

export const getServerSideProps = async (ctx: { req: { headers: any } }) => {
  const headers = ctx.req.headers;
  try {
    const res = await axios.get('http://localhost:3001/user/auth', {
      headers,
      withCredentials: true,
    });
    return { props: {} };
  } catch (error) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
      props: {},
    };
  }
};

const Files: NextPage = () => {
  const [lastFilesDropped, setLastFilesDropped] = useState<File[]>([]);
  const onDrop = useCallback(
    (
      acceptedFiles: File[],
      rejectedFiles: FileRejection[],
      event: DropEvent,
    ) => {
      console.log(acceptedFiles, rejectedFiles, event);
      setLastFilesDropped(acceptedFiles);
    },
    [],
  );
  const { getInputProps, getRootProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Fragment>
      <Head>
        <title>Files - TecCloud</title>
      </Head>
      <Scaffold>
        <Box
          sx={{
            width: '100%',
            minHeight: 'calc(100vh - 112px)',
            bgcolor: isDragActive ? 'primary.main' : 'background.default',
          }}
          {...getRootProps()}
        >
          <Typography paragraph>My files...</Typography>
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography paragraph>Now drop it!</Typography>
          ) : (
            <Typography paragraph>Drop a file here!</Typography>
          )}
          {lastFilesDropped.map((file, i) => (
            <Typography paragraph key={i}>
              Fake uploading file {file.name}
            </Typography>
          ))}
        </Box>
      </Scaffold>
    </Fragment>
  );
};

export default Files;
