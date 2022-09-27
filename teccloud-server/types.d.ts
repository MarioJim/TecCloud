import type {
  GetServerSideProps,
  GetServerSidePropsResult,
  NextPage,
} from 'next';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  folderId: number;
}

interface UserAsProps {
  user: User;
}

export type GetServerSideUser = GetServerSideProps<UserAsProps>;

export type AuthenticatedPage = NextPage<UserAsProps>;
