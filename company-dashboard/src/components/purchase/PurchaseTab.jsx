import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios, { API } from '../../api';

export default function PurchaseTab() {
  const [category, setCategory] = useState('drinks');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('50000000');
  const [minAmount, setMinAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [purchased, setPurchased] = useState(null);

  const handleMatch = async () => {
    setLoading(true); setResult(null); setPurchased(null);
    try {
      const r = await axios.post(`${API}/company/match`, {
        company_name: 'Coca-Cola Kazakhstan', category, city: city || undefined,
        budget_lamports: parseInt(budget), min_amount: minAmount ? parseInt(minAmount) : undefined,
      });
      setResult(r.data);
    } catch (e) { setResult({ error: 'Failed to match' }); }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!result?.ai_decision) return;
    setLoading(true);
    try {
      const r = await axios.post(`${API}/company/purchase`, {
        company_name: 'Coca-Cola Kazakhstan',
        matched_ids: result.ai_decision.matched_ids,
        price_per_profile_lamports: result.ai_decision.price_per_profile_lamports,
        ai_reasoning: result.ai_decision.reasoning,
        ai_confidence: result.ai_decision.confidence,
      });
      setPurchased(r.data);
    } catch (e) {}
    setLoading(false);
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', bgcolor: '#f8f9fa' }} className="hide-scrollbar">

      <Box sx={{ px: 5, pt: 4, pb: 2 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>Data Marketplace</Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, mb: 0.5 }}>Purchase Consumer Data</Typography>
        <Typography sx={{ fontSize: 14, color: '#5f6368' }}>AI autonomously selects the best audience, sets pricing, and executes payment via Solana smart contract</Typography>
      </Box>

      <Box sx={{ px: 5, pb: 4 }}>
        <Grid container spacing={3}>

          {/* LEFT: Configuration */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card><CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 2 }}>Configure Your Request</Typography>

              <TextField select fullWidth label="Category" value={category} onChange={e => setCategory(e.target.value)} sx={{ mb: 2 }} size="small">
                {['drinks', 'food', 'water', 'snacks', 'dairy', 'household'].map(c => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
              </TextField>

              <TextField select fullWidth label="City (optional)" value={city} onChange={e => setCity(e.target.value)} sx={{ mb: 2 }} size="small">
                <MenuItem value="">All Cities</MenuItem>
                <MenuItem value="Almaty">Almaty</MenuItem>
                <MenuItem value="Astana">Astana</MenuItem>
                <MenuItem value="Shymkent">Shymkent</MenuItem>
              </TextField>

              <TextField fullWidth label="Min Purchase Amount (T)" value={minAmount} onChange={e => setMinAmount(e.target.value)} type="number" sx={{ mb: 2 }} size="small" placeholder="e.g. 1000" />

              <TextField fullWidth label="Budget (lamports)" value={budget} onChange={e => setBudget(e.target.value)} type="number" sx={{ mb: 3 }} size="small" helperText={`~ ${Math.round(parseInt(budget || 0) * 0.0000001 * 450).toLocaleString()} T`} />

              <Button variant="contained" fullWidth size="large" onClick={handleMatch} disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SmartToyIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 15, py: 1.2, bgcolor: '#1a73e8' }}>
                {loading ? 'AI is matching...' : 'Find Audience with AI'}
              </Button>
            </CardContent></Card>

            {/* How it works mini */}
            <Card sx={{ mt: 2 }}><CardContent>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>How AI Matching Works</Typography>
              {[
                'You set criteria: category, city, budget',
                'Claude AI analyzes all available consumer profiles',
                'AI autonomously selects matching profiles & sets price',
                'You confirm — Solana smart contract executes payment',
                'Anonymized data delivered instantly',
              ].map((s, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#1a73e8', minWidth: 14 }}>{i + 1}.</Typography>
                  <Typography sx={{ fontSize: 11, color: '#5f6368' }}>{s}</Typography>
                </Box>
              ))}
            </CardContent></Card>
          </Grid>

          {/* RIGHT: Results */}
          <Grid size={{ xs: 12, md: 7 }}>
            {!result && !loading && (
              <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <SmartToyIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
                  <Typography sx={{ fontSize: 14, color: '#80868b' }}>Configure your request and click "Find Audience"</Typography>
                  <Typography sx={{ fontSize: 11, color: '#bdc1c6', mt: 0.5 }}>Claude AI will autonomously match the best consumer profiles</Typography>
                </Box>
              </Card>
            )}

            {loading && (
              <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Claude AI is analyzing profiles...</Typography>
                  <Typography sx={{ fontSize: 11, color: '#80868b', mt: 0.5 }}>Matching audience, calculating optimal pricing</Typography>
                </Box>
              </Card>
            )}

            {result && !result.error && !purchased && (
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SmartToyIcon sx={{ color: '#1a73e8' }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 700 }}>AI Decision</Typography>
                    <Chip label={`${result.ai_decision?.confidence || 85}% confidence`} size="small" sx={{ bgcolor: '#e6f4ea', color: '#137333', fontWeight: 600, fontSize: 11, ml: 'auto' }} />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#1a73e8' }}>{result.matched}</Typography>
                        <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase' }}>Profiles Matched</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#34a853' }}>{result.total_cost_tenge?.toLocaleString()}</Typography>
                        <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase' }}>Total Cost (T)</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#fbbc04' }}>{Math.round((result.ai_decision?.price_per_profile_lamports || 0) * 0.0000001 * 450)}</Typography>
                        <Typography sx={{ fontSize: 10, color: '#80868b', textTransform: 'uppercase' }}>Per Profile (T)</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#5f6368', mb: 0.5 }}>AI Reasoning:</Typography>
                    <Typography sx={{ fontSize: 12, color: '#3c4043', lineHeight: 1.5 }}>{result.ai_decision?.reasoning || result.message}</Typography>
                  </Box>

                  <Button variant="contained" fullWidth size="large" onClick={handlePurchase}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: 15, py: 1.2, bgcolor: '#34a853', '&:hover': { bgcolor: '#2e7d32' } }}>
                    Confirm Purchase — {result.total_cost_tenge?.toLocaleString()} T via Solana
                  </Button>
                </CardContent>
              </Card>
            )}

            {purchased && (
              <Card sx={{ border: '2px solid #34a853' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 56, color: '#34a853', mb: 1 }} />
                  <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>Purchase Complete!</Typography>
                  <Typography sx={{ fontSize: 13, color: '#5f6368', mb: 2 }}>{purchased.purchased_profiles} profiles purchased. Data delivered.</Typography>
                  {purchased.explorer_url && (
                    <Chip label="View on Solana Explorer" component="a" href={purchased.explorer_url} target="_blank" clickable
                      sx={{ bgcolor: '#e8f0fe', color: '#1a73e8', fontWeight: 600, fontSize: 12 }} />
                  )}
                </CardContent>
              </Card>
            )}

            {result?.error && (
              <Card sx={{ border: '2px solid #ea4335' }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#ea4335' }}>No matching profiles found</Typography>
                  <Typography sx={{ fontSize: 12, color: '#5f6368', mt: 1 }}>Try adjusting your criteria or increasing the budget</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
