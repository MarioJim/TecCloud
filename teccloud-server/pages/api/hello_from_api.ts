import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const serverRes = await fetch('http://localhost:3001/');
  const serverBody = await serverRes.text();
  res.status(200).json({ responseFromServer: serverBody });
};

export default handler;
