import { useState, useEffect } from "react";
import { ethers } from "ethers";
import './App.css'
import { stakingABI, erc20ABI } from "./Components/Abi/Abi";
import StakingPlans from "./Components/StakingPlans";

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
  const [stakes, setStakes] = useState([]);

  useEffect(() => {
    if (window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
    }
  }, []);

  useEffect(() => {
    if (account && stakingContract) {
      fetchStakes(); // Fetch stakes whenever the account is set or stakingContract is available
    }
  }, [account, stakingContract]);

  const connectWallet = async () => {
    if (!provider) return alert("Please install MetaMask");

    const accounts = await provider.send("eth_requestAccounts", []);
    const web3Signer = await provider.getSigner();

    setSigner(web3Signer);
    setAccount(accounts[0]);

    // Initialize contracts
    setStakingContract(new ethers.Contract(stakingContractAddress, stakingABI, web3Signer));
    setERC20Contract(new ethers.Contract(erc20TokenAddress, erc20ABI, web3Signer));
  };

  const stakeTokens = async () => {
    if (!stakingContract || !signer) return alert("Connect wallet first");
    if (!amount) return alert("Enter an amount");

    try {
      const tx = await stakingContract.stake(ethers.parseUnits(amount, 18), lockPeriod);
      await tx.wait();
      alert("Staked successfully!");
      fetchStakes(); // Fetch and update stakes after staking
    } catch (error) {
      console.error(error);
      alert("Staking failed");
    }
  };

  const withdrawStake = async (index) => {
    if (!stakingContract || !signer) return alert("Connect wallet first");

    try {
      const tx = await stakingContract.withdraw(index);
      await tx.wait();
      alert("Withdrawn successfully!");
      fetchStakes();
    } catch (error) {
      console.error(error);
      alert("Withdrawal failed");
    }
  };

  const fetchStakes = async () => {
    if (!stakingContract || !account) return;

    try {
      const userStakes = await stakingContract.getStake(account);
      setStakes(userStakes);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-2">
      <h1 className="header-1">ERC20 Staking DApp</h1>
      {!account ? (
        <button className="wallet" onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p className="wallet-1">Connected: {account}</p>
          <StakingPlans
            setLockPeriod={setLockPeriod}
            setAmount={setAmount}
            erc20Contract={erc20Contract}
            stakingContractAddress={stakingContractAddress}
            stakeTokens={stakeTokens}
          />
          <h2 className="your-stats">Your Stakes</h2>
          <div className="stats">
            {stakes.map((stake, index) => (
              <div className="stake" key={index}>
                <p>
                  Amount: <span>{ethers.formatUnits(stake.amount, 18)} USDT</span> | Locked: <span>{stake.lockPeriod} seconds</span>
                </p>
                <div className="withdraw-container">
                  {stake.withdrawn ? (
                    <span className="withdrawn">(Withdrawn)</span>
                  ) : (
                    <button className="withdraw-btn" onClick={() => withdrawStake(index)}>
                      WITHDRAW
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
