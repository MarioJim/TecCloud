import type { NextPage } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from 'next/link';

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
      <Link href='/sign_up'>
        <Button variant='contained' size='large'>
          Login
        </Button>
      </Link>
      <Button variant='contained' size='large'>
        Sign up
      </Button>
    </Stack>
  </Container>
);

export default Home;
