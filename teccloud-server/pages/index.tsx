import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const res = await fetch('http://localhost:3001/user/auth', {
    credentials: 'include',
    headers: ctx.req.headers as HeadersInit,
  });
  if (res.status === 201) {
    return {
      redirect: {
        permanent: false,
        destination: '/files',
      },
    };
  }
  return { props: {} };
};

const Home: NextPage = () => (
  <Container>
    <Head>
      <title>TecCloud</title>
      <meta
        name='description'
        content='Store, search and share your documents'
      />
      <link rel='icon' href='/favicon.ico' />
    </Head>

    <Stack
      direction='column'
      justifyContent='center'
      alignItems='center'
      spacing={2}
      minHeight='100vh'
    >
      <Typography variant='h1' align='center' fontSize={'4.5rem'}>
        Welcome to TecCloud!
      </Typography>
      <Link href='/login'>
        <Button variant='contained' size='large'>
          Login
        </Button>
      </Link>
      <Link href='/sign_up'>
        <Button variant='contained' size='large'>
          Sign up
        </Button>
      </Link>
    </Stack>
  </Container>
);

export default Home;
