import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api';

const ACTION_COLORS = {
  'receipt.flagged': '#fbbc04',
  'receipt.approved': '#34a853',
  'receipt.rejected': '#ea4335',
  'company.approved': '#34a853',
  'company.suspended': '#ea4335',
  'withdrawal.requested': '#1a73e8',
  'withdrawal.processing': '#fbbc04',
  'withdrawal.completed': '#34a853',
  'withdrawal.failed': '#ea4335',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-log?limit=200').then(r => { setLogs(r.data.logs || []); setLoading(false); });
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 60 },
    {
      field: 'action', headerName: 'Action', width: 200,
      renderCell: (p) => <Chip label={p.value} size="small" sx={{ bgcolor: (ACTION_COLORS[p.value] || '#80868b') + '15', color: ACTION_COLORS[p.value] || '#80868b', fontWeight: 600, fontSize: 11, height: 22 }} />,
    },
    { field: 'entity_type', headerName: 'Entity', width: 100, renderCell: (p) => <Chip label={p.value} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} /> },
    { field: 'entity_id', headerName: 'Entity ID', width: 100 },
    { field: 'actor', headerName: 'Actor', width: 120, renderCell: (p) => <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{p.value || 'system'}</Typography> },
    {
      field: 'details', headerName: 'Details', width: 300,
      renderCell: (p) => <Typography sx={{ fontSize: 11, color: '#5f6368', fontFamily: 'monospace' }}>{p.value ? String(p.value).slice(0, 60) : ''}</Typography>,
    },
    { field: 'created_at', headerName: 'Time', width: 160, renderCell: (p) => <Typography sx={{ fontSize: 11, color: '#80868b' }}>{(p.value || '').slice(0, 19)}</Typography> },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Audit Log</Typography>
      <Card>
        <DataGrid rows={logs} columns={columns} loading={loading} autoHeight
          pageSizeOptions={[25, 50, 100]} initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
          disableRowSelectionOnClick
          sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8f9fa' }, '& .MuiDataGrid-columnHeaderTitle': { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#80868b' }, '& .MuiDataGrid-cell': { fontSize: 13 } }} />
      </Card>
    </Box>
  );
}
