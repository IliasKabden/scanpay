import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/users').then((r) => {
      setUsers(r.data.users || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/admin/users/${deleteTarget}`);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { field: 'telegram_id', headerName: 'TG ID', width: 120 },
    {
      field: 'name', headerName: 'Name', width: 180,
      valueGetter: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-',
    },
    { field: 'username', headerName: 'Username', width: 120, renderCell: (p) => p.value ? `@${p.value}` : '-' },
    { field: 'phone', headerName: 'Phone', width: 130, renderCell: (p) => p.value || '-' },
    {
      field: 'age_group', headerName: 'Age', width: 100,
      renderCell: (p) => p.value ? <Chip label={p.value} size="small" sx={{ bgcolor: '#d3e3fd', color: '#0b57d0', fontSize: 11, height: 22 }} /> : '-',
    },
    { field: 'gender', headerName: 'Gender', width: 90, renderCell: (p) => p.value || '-' },
    { field: 'city', headerName: 'City', width: 110, renderCell: (p) => p.value || '-' },
    { field: 'receipt_count', headerName: 'Receipts', width: 90, type: 'number' },
    {
      field: 'created_at', headerName: 'Created', width: 110,
      renderCell: (p) => <Typography sx={{ fontSize: 11, color: '#80868b' }}>{(p.value || '').slice(0, 10)}</Typography>,
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false,
      renderCell: (p) => (
        <IconButton size="small" color="error" onClick={() => setDeleteTarget(p.row.telegram_id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Users</Typography>
      <Card>
        <DataGrid
          rows={users}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={`Delete user ${deleteTarget} and all their receipts?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
