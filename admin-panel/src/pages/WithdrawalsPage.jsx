import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api';

const STATUS_COLORS = {
  pending: { bg: '#fef7e0', color: '#e37400' },
  processing: { bg: '#e8f0fe', color: '#1a73e8' },
  completed: { bg: '#e6f4ea', color: '#137333' },
  failed: { bg: '#fce8e6', color: '#c5221f' },
};

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/withdrawals').then(r => {
      setWithdrawals(r.data.withdrawals || []);
      setCounts(r.data.counts || {});
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const processWithdrawal = async (id, status) => {
    await api.put(`/admin/withdrawals/${id}/process`, { status, solana_tx: status === 'completed' ? `tx_${Date.now()}` : '' });
    load();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'telegram_id', headerName: 'User', width: 130 },
    {
      field: 'name', headerName: 'Name', width: 140,
      valueGetter: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-',
    },
    {
      field: 'amount_tenge', headerName: 'Amount', width: 120,
      renderCell: (p) => <Typography sx={{ fontWeight: 600, color: '#1a73e8', fontSize: 13 }}>{p.value?.toLocaleString() || 0} T</Typography>,
    },
    {
      field: 'amount_lamports', headerName: 'Lamports', width: 120,
      renderCell: (p) => <Typography sx={{ fontSize: 11, color: '#80868b' }}>{(p.value / 1e9).toFixed(4)} SOL</Typography>,
    },
    {
      field: 'wallet_address', headerName: 'Wallet', width: 150,
      renderCell: (p) => <Typography sx={{ fontSize: 10, fontFamily: 'monospace' }}>{(p.value || '').slice(0, 16)}...</Typography>,
    },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (p) => {
        const c = STATUS_COLORS[p.value] || STATUS_COLORS.pending;
        return <Chip label={p.value} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, fontSize: 11, height: 22 }} />;
      },
    },
    { field: 'created_at', headerName: 'Requested', width: 130, renderCell: (p) => <Typography sx={{ fontSize: 11, color: '#80868b' }}>{(p.value || '').slice(0, 16)}</Typography> },
    {
      field: 'actions', headerName: 'Actions', width: 200, sortable: false,
      renderCell: (p) => {
        if (p.row.status === 'completed' || p.row.status === 'failed') return null;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {p.row.status === 'pending' && <Button size="small" variant="outlined" onClick={() => processWithdrawal(p.row.id, 'processing')} sx={{ textTransform: 'none', fontSize: 10 }}>Process</Button>}
            {p.row.status === 'processing' && <Button size="small" variant="contained" color="success" onClick={() => processWithdrawal(p.row.id, 'completed')} sx={{ textTransform: 'none', fontSize: 10 }}>Complete</Button>}
            <Button size="small" variant="outlined" color="error" onClick={() => processWithdrawal(p.row.id, 'failed')} sx={{ textTransform: 'none', fontSize: 10 }}>Fail</Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Withdrawals</Typography>
        {counts.pending > 0 && <Chip label={`${counts.pending} pending`} color="warning" size="small" />}
      </Box>

      <Card>
        <DataGrid rows={withdrawals} columns={columns} loading={loading} autoHeight
          pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8f9fa' }, '& .MuiDataGrid-columnHeaderTitle': { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#80868b' }, '& .MuiDataGrid-cell': { fontSize: 13 } }} />
      </Card>
    </Box>
  );
}
