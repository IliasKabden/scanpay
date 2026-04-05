import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { DataGrid } from '@mui/x-data-grid';
import api from '../api';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/companies').then((r) => {
      setCompanies(r.data.companies || []);
      setLoading(false);
    });
  }, []);

  const columns = [
    { field: 'name', headerName: 'Company', width: 220, renderCell: (p) => <strong>{p.value}</strong> },
    { field: 'industry', headerName: 'Industry', width: 160 },
    { field: 'product_count', headerName: 'Products', width: 120, type: 'number' },
    { field: 'detection_count', headerName: 'Detections', width: 120, type: 'number' },
    {
      field: 'created_at', headerName: 'Created', width: 130,
      renderCell: (p) => <Typography sx={{ fontSize: 11, color: '#80868b' }}>{(p.value || '').slice(0, 10)}</Typography>,
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Companies</Typography>
      <Card>
        <DataGrid
          rows={companies}
          columns={columns}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25]}
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
