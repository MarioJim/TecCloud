import type { GetServerSideUser, AuthenticatedPage, User } from '../../types';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDropzone } from 'react-dropzone';
import Scaffold from '../../components/Scaffold';
import UploadModal from '../../components/UploadModal';
import UploadStatusDialog, {
  UploadStatus,
} from '../../components/UploadStatusDialog';
import SingleFile from '../../components/SingleFile';
import SingleFolder from '../../components/SingleFolder';
import SinglePage from '../../components/SinglePage';
import ReplaceFileModal from '../../components/ReplaceFileModal';
import { apiServer } from '../../config';
import uploadCallback from '../../lib/uploadCallback';

export const getServerSideProps: GetServerSideUser = async (ctx) => {
  const res = await fetch(`${apiServer}/user/auth/${ctx.params!.folderId}`, {
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

const thumbnailFromFileInfo = (file: any): string | undefined => {
  if (file.fileType.startsWith('image/')) {
    return `${apiServer}/files/download/${file.fileName}`;
  }
  for (const page of file.pages || []) {
    if (page.thumbnailPath) {
      return `${apiServer}/files/thumbnail/${page.thumbnailPath}`;
    }
  }
  return undefined;
};

const thumbnailFromPage = (page: any): string | undefined => {
  if (page.file.fileType.startsWith('image/')) {
    return `${apiServer}/files/download/${page.file.fileName}`;
  }
  if (page.thumbnailPath) {
    return `${apiServer}/files/thumbnail/${page.thumbnailPath}`;
  }
  return undefined;
};

const Files: AuthenticatedPage = ({ user }) => {
  const router = useRouter();
  const { folderId: maybeFolderId } = router.query;
  const folderId = parseInt((maybeFolderId as string | undefined) || '');
  useEffect(() => {
    if (isNaN(folderId)) {
      router.push(`/files/${user.folderId}`);
    }
  }, [router, folderId, user.folderId]);
  const searchQuery = router.query.q;

  const [numberDraggedFiles, setNumberDraggedFiles] = useState<number>(0);
  const [folderFiles, setFolderFiles] = useState<any[]>([]);
  const [replaceFiles, setReplaceFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [parentId, setParentId] = useState<any>();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'initial',
  });

  useEffect(() => {
    const fetchFiles = async () => {
      if (searchQuery) {
        const pagesResponse = await fetch(
          `${apiServer}/folder/search/${folderId}?q=${searchQuery}`,
          {
            credentials: 'include',
          },
        );
        const pagesJson = await pagesResponse.json();
        setPages(pagesJson);
      } else {
        const filesResponse = await fetch(`${apiServer}/files/${folderId}`, {
          credentials: 'include',
        });
        const filesJson = await filesResponse.json();
        setFolderFiles(filesJson.files);
        setFolders(filesJson.folders);
        setParentId(filesJson.parentId);
      }
    };

    fetchFiles().catch(console.error);
  }, [folderId, searchQuery]);

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
      <Scaffold
        user={user}
        folderId={folderId}
        folderFiles={folderFiles}
        setFolderFiles={(files: any[]) => {
          setFolderFiles([...files]);
        }}
        setReplaceFiles={(files: any[]) => {
          setReplaceFiles([...files]);
        }}
        setFolders={(folder: any) => {
          setFolders((prev) => [...prev, folder]);
        }}
        onSearchQueryChanged={(query) => {
          if (query) {
            router.push(`/files/${folderId}?q=${encodeURIComponent(query)}`);
          } else {
            router.push(`/files/${folderId}`);
          }
        }}
      >
        <UploadModal open={isDragActive} numberFiles={numberDraggedFiles} />
        <UploadStatusDialog status={uploadStatus} setStatus={setUploadStatus} />
        {replaceFiles.map((file) => (
          <ReplaceFileModal
            key={file.replace.name}
            folderId={folderId}
            prevFileName={file.prevFileName}
            newFile={file.replace}
            removeFile={(fileOriginalName: string) => {
              setReplaceFiles(
                replaceFiles.filter(
                  (replaceFile) =>
                    replaceFile.replace.name !== fileOriginalName,
                ),
              );
            }}
            setFolderFiles={(files: any[]) => {
              setFolderFiles([...files]);
            }}
          />
        ))}
        {parentId && (
          <Stack
            direction='row'
            justifyContent='flex-start'
            alignItems='center'
            spacing={1}
          >
            <IconButton size='large' href={`/files/${parentId}`}>
              <ArrowBackIcon fontSize='inherit' />
            </IconButton>
            <Typography noWrap sx={{ width: 0.6 }}>
              Go back
            </Typography>
          </Stack>
        )}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {!searchQuery && folderFiles.length === 0 && folders.length === 0 && (
            <>
              <Typography paragraph flex='0 0 100%'>
                {' '}
              </Typography>
              <Typography paragraph flex='0 0 100%'>
                Oops... it seems there are no files here :(
              </Typography>
              <br />
              <Typography paragraph>Drop a file here to upload it!</Typography>
            </>
          )}
          {searchQuery && pages.length === 0 && (
            <Typography paragraph>
              Oops... it seems your search returned no files :(
            </Typography>
          )}
          {folders.length > 0 &&
            !searchQuery &&
            folders.map((folder) => (
              <SingleFolder
                key={`folder-${folder.id}`}
                folderId={folder.id}
                folderName={folder.name}
                folders={folders}
                setFolders={(folderToRemove: any) => {
                  setFolders((prev) =>
                    prev.filter((folder) => folder.id !== folderToRemove),
                  );
                }}
              />
            ))}
          {folderFiles.length > 0 &&
            !searchQuery &&
            folderFiles.map((file) => (
              <SingleFile
                key={`file-${file.id}`}
                fileName={file.fileName}
                originalName={file.originalName}
                shareProps={{
                  fileId: file.id,
                  folderId: file.folderId,
                  accessByLink: file.accessByLink,
                  users: file.users,
                  ownerId: file.file_access.ownerId,
                  currentUser: user,
                }}
                thumbnail={thumbnailFromFileInfo(file)}
              />
            ))}
          {pages.length > 0 &&
            searchQuery &&
            pages.map((page) => (
              <SinglePage
                key={`${page.file.id}_p${page.number}`}
                fileName={page.file.fileName}
                originalName={page.file.originalName}
                thumbnail={thumbnailFromPage(page)}
                pageNum={page.number}
              />
            ))}
        </Box>
        <Box sx={{ width: '100%', flexGrow: 1 }} {...getRootProps()}>
          <input {...getInputProps()} />
        </Box>
      </Scaffold>
    </Fragment>
  );
};

export default Files;
