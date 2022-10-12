import iconv from 'iconv-lite';

export const utf8_to_iso88591 = (text: string): string => {
  const encodedText = iconv.encode(text, 'utf-8');
  return iconv.decode(encodedText, 'iso-8859-1');
};

export const iso88591_to_utf8 = (text: string): string => {
  const encodedText = iconv.encode(text, 'iso-8859-1');
  return iconv.decode(encodedText, 'utf-8');
};
