const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Получить баланс кошелька
async function getBalance(walletAddress) {
  const pubkey = new PublicKey(walletAddress);
  const balance = await connection.getBalance(pubkey);
  return balance; // в lamports
}

// Получить транзакции кошелька
async function getTransactions(walletAddress, limit = 10) {
  const pubkey = new PublicKey(walletAddress);
  const signatures = await connection.getSignaturesForAddress(pubkey, { limit });
  return signatures.map(s => ({
    signature: s.signature,
    timestamp: s.blockTime,
    explorer_url: `https://explorer.solana.com/tx/${s.signature}?cluster=devnet`
  }));
}

module.exports = { connection, getBalance, getTransactions };
