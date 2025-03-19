import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import MainSection from "./Components/MainSection";
import Plan1Page from "./Components/Plan1Page";
import Plan2Page from "./Components/Plan2Page";
import Plan3Page from "./Components/Plan3Page";
import WalletConnect from "./Components/WalletConnect";
import Withdraw from "./Components/Withdraw";
import WithdrawButton from "./Components/WithdrawButton";

function App() {
  const [walletAddress, setWalletAddress] = useState(null); // Store walletAddress
  const [stakingContract, setStakingContract] = useState(null); // Store stakingContract
  const [erc20Contract, setErc20Contract] = useState(null); // Store erc20Contract

  // When contracts are initialized, update the state to trigger re-render
  useEffect(() => {
    if (stakingContract && erc20Contract) {
      console.log("Staking Contract initialized:", stakingContract);
      console.log("ERC20 Contract initialized:", erc20Contract);
    }
  }, [stakingContract, erc20Contract]);

  return (
    <BrowserRouter>
      <div className="App">
        {/* Pass setWalletAddress and contract setters to WalletConnect */}
        <WalletConnect
          setWalletAddress={setWalletAddress}
          setStakingContract={setStakingContract}
          setErc20Contract={setErc20Contract}
        />
        <WithdrawButton />
        
        <Routes>
          <Route path="/" element={<MainSection />} />
          {/* Pass walletAddress, stakingContract, and erc20Contract to Plan1Page */}
          <Route
            path="/plan1"
            element={<Plan1Page walletAddress={walletAddress} stakingContract={stakingContract} erc20Contract={erc20Contract} />}
          />
          <Route path="/plan2" element={<Plan2Page />} />
          <Route path="/plan3" element={<Plan3Page />} />
          <Route path="/withdraw" element={<Withdraw />} />
          
        </Routes>
      </div>
    </BrowserRouter>

    
  );
}

export default App;
