import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import SolanaLink from '../components/SolanaLink';
import api from '../api';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/receipts').then((r) => {
      setReceipts(r.data.receipts || []);
      setLoading(false);
    });
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'telegram_id', headerName: 'User', width: 130 },
    { field: 'store_name', headerName: 'Store', width: 150, renderCell: (p) => <strong>{p.value || '-'}</strong> },
    {
      field: 'total_amount', headerName: 'Amount', width: 120, type: 'number',
      renderCell: (p) => <Typography sx={{ fontWeight: 600, color: '#1a73e8', fontSize: 13 }}>{p.value || 0} T</Typography>,
    },
    {
      field: 'category', headerName: 'Category', width: 130,
      renderCell: (p) => p.value ? <Chip label={p.value} size="small" sx={{ bgcolor: '#e6f4ea', color: '#137333', fontSize: 11, height: 22 }} /> : '-',
    },
    {
      field: 'date', headerName: 'Date', width: 110,
      renderCell: (p) => <Typography sx={{ fontSize: 11 }}>{p.value || ''}</Typography>,
    },
    {
      field: 'solana_tx', headerName: 'Solana TX', width: 180,
      renderCell: (p) => <SolanaLink tx={p.value} />,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Receipts</Typography>
      <Card>
        <DataGrid
          rows={receipts}
          columns={columns}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8f9fa' },
            '& .MuiDataGrid-columnHeaderTitle': { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#80868b', letterSpacing: 0.3 },
            '& .MuiDataGrid-cell': { fontSize: 13 },
          }}
        />
      </Card>
    </Box>
  );
}
