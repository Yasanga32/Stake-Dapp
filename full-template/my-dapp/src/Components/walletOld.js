import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { stakingABI, erc20ABI } from "./Components/Abi/Abi";
import ApproveButton from "./Components/ApproveButton";

const stakingContractAddress = "0x4A5f9E75aaEe682bd11588aDe4F38a7d59C251E2";
const erc20TokenAddress = "0x78Fc3C79f48e866a08537f00C742510e8044eecB";

export default function StakingApp() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [erc20Contract, setERC20Contract] = useState(null);
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState(30);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) return alert("Please install MetaMask");

    const accounts = await provider.send("eth_requestAccounts", []);
    const web3Signer = await provider.getSigner();

    setSigner(web3Signer);
    setAccount(accounts[0]);

    setStakingContract(new ethers.Contract(stakingContractAddress, stakingABI, web3Signer));
    setERC20Contract(new ethers.Contract(erc20TokenAddress, erc20ABI, web3Signer));
  };

  const stakeTokens = async () => {
    if (!stakingContract || !signer) return alert("Connect wallet first");
    if (!isApproved) return alert("You must approve tokens first!");

    try {
      const tx = await stakingContract.stake(ethers.parseUnits(amount, 18), lockPeriod);
      await tx.wait();
      alert("Staked successfully!");
    } catch (error) {
      console.error(error);
      alert("Staking failed");
    }
  };

  return (
    <div>
      <h1>ERC20 Staking DApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select onChange={(e) => setLockPeriod(Number(e.target.value))}>
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
          </select>

          {/* Approve Button */}
          <ApproveButton
            erc20Contract={erc20Contract}
            stakingContractAddress={stakingContractAddress}
            amount={amount}
            onApproval={setIsApproved}
          />

          {/* Stake Button (Disabled until approved) */}
          <button onClick={stakeTokens} disabled={!isApproved}>
            Stake
          </button>
        </div>
      )}
    </div>
  );
}
