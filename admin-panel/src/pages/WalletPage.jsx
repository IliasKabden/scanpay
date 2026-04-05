import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import api from '../api';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/solana/wallet')
      .then((r) => setWallet(r.data))
      .catch(() => setWallet({ address: '-', balance: '0', network: 'devnet' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton variant="rounded" height={200} />;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Solana Wallet</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Chip
              label={wallet.network}
              size="small"
              sx={{ bgcolor: wallet.network === 'mainnet' ? '#e6f4ea' : '#e8f0fe', color: wallet.network === 'mainnet' ? '#137333' : '#1a73e8', fontWeight: 600 }}
            />
          </Box>

          <Typography sx={{ fontSize: 12, color: '#80868b', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Wallet Address</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 14, wordBreak: 'break-all', bgcolor: '#f8f9fa', p: 1.5, borderRadius: 1, flex: 1 }}>
              {wallet.address}
            </Typography>
            <IconButton size="small" onClick={() => navigator.clipboard.writeText(wallet.address)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography sx={{ fontSize: 12, color: '#80868b', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Balance</Typography>
          <Typography sx={{ fontSize: 36, fontWeight: 700, color: '#1a73e8' }}>
            {wallet.balance} <Typography component="span" sx={{ fontSize: 18, color: '#5f6368' }}>SOL</Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
