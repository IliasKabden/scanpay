import Link from '@mui/material/Link';

export default function SolanaLink({ tx }) {
  if (!tx || tx === '-') return '-';
  const url = `https://explorer.solana.com/tx/${tx}?cluster=devnet`;
  return (
    <Link href={url} target="_blank" rel="noopener" sx={{ fontSize: 12 }}>
      {tx.slice(0, 16)}...
    </Link>
  );
}
