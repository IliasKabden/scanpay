import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function KPICard({ label, value, color }) {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color }}>{value}</Typography>
        <Typography sx={{ fontSize: 10, color: '#80868b', mt: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}
