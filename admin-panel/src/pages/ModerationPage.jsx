import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../api';

export default function ModerationPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/moderation?status=${tab}`).then(r => {
      setItems(r.data.items || []);
      setCounts(r.data.counts || {});
      setLoading(false);
    });
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    await api.post(`/admin/moderation/${id}/approve`, { reviewer: 'admin' });
    load();
  };

  const reject = async () => {
    if (!rejectDialog) return;
    await api.post(`/admin/moderation/${rejectDialog}/reject`, { reviewer: 'admin', notes: rejectNotes });
    setRejectDialog(null);
    setRejectNotes('');
    load();
  };

  const reasonColors = { duplicate: '#ea4335', price_anomaly: '#fbbc04', frequency_limit: '#ff6d01', future_date: '#ea4335', manual: '#5f6368' };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Moderation Queue</Typography>
        {counts.pending > 0 && <Chip label={`${counts.pending} pending`} color="warning" size="small" />}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="pending" label={`Pending (${counts.pending})`} />
        <Tab value="approved" label={`Approved (${counts.approved})`} />
        <Tab value="rejected" label={`Rejected (${counts.rejected})`} />
      </Tabs>

      {items.length === 0 && !loading && (
        <Card><CardContent sx={{ textAlign: 'center', py: 4, color: '#80868b' }}>No items in this queue</CardContent></Card>
      )}

      {items.map(item => (
        <Card key={item.id} sx={{ mb: 1.5 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Chip label={item.entity_type} size="small" sx={{ bgcolor: '#e8f0fe', color: '#1a73e8', fontWeight: 600, fontSize: 11 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{item.entity_summary || `#${item.entity_id}`}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {(item.reason || '').split(',').map((r, i) => (
                  <Chip key={i} label={r} size="small" sx={{ height: 18, fontSize: 10, bgcolor: (reasonColors[r] || '#80868b') + '15', color: reasonColors[r] || '#80868b' }} />
                ))}
              </Box>
              {item.telegram_id && <Typography sx={{ fontSize: 11, color: '#80868b', mt: 0.3 }}>User: {item.telegram_id}</Typography>}
            </Box>
            <Typography sx={{ fontSize: 11, color: '#80868b' }}>{(item.created_at || '').slice(0, 16)}</Typography>
            {tab === 'pending' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                  onClick={() => approve(item.id)} sx={{ textTransform: 'none', fontSize: 12 }}>Approve</Button>
                <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                  onClick={() => setRejectDialog(item.id)} sx={{ textTransform: 'none', fontSize: 12 }}>Reject</Button>
              </Box>
            )}
            {tab !== 'pending' && item.reviewer && (
              <Typography sx={{ fontSize: 11, color: '#80868b' }}>by {item.reviewer}</Typography>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!rejectDialog} onClose={() => setRejectDialog(null)}>
        <DialogTitle>Reject Item</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Reason for rejection" value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(null)}>Cancel</Button>
          <Button onClick={reject} color="error" variant="contained">Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
