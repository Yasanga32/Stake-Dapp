import React, { useState, useEffect } from "react";
import { ethers } from "ethers"; // ethers v6 import
import { BrowserProvider } from "ethers/providers"; // Correct import for v6
import "./WalletConnect.css";
import { stakingABI, erc20ABI } from "./Abi/Abi";

function WalletConnect({ setWalletAddress, setStakingContract, setErc20Contract }) {  
    const [walletAddress, setWalletAddressInternal] = useState("");
    const [ownerAddress, setOwnerAddress] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false); // Added loading state

    const stakingContractAddress = "0x4A5f9E75aaEe682bd11588aDe4F38a7d59C251E2";
    const erc20ContractAddress = "0x78Fc3C79f48e866a08537f00C742510e8044eecB";

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        try {
            setLoading(true);  // Show loading indicator

            const provider = new BrowserProvider(window.ethereum); // Use BrowserProvider for v6
            const accounts = await provider.send("eth_requestAccounts", []);
            const address = accounts[0];
            setWalletAddressInternal(address);  // Set local state
            setWalletAddress(address);  // Pass to parent component

            // Continue with contract creation...
            const stakingContractInstance = new ethers.Contract(
                stakingContractAddress,
                stakingABI,
                provider
            );
            setStakingContract(stakingContractInstance);  // Pass staking contract to parent

            const erc20ContractInstance = new ethers.Contract(
                erc20ContractAddress,
                erc20ABI,
                provider
            );
            setErc20Contract(erc20ContractInstance);  // Pass ERC20 contract to parent

            console.log("Staking Contract:", stakingContractInstance);
            console.log("ERC20 Contract:", erc20ContractInstance);

            await fetchOwner(stakingContractInstance);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setErrorMessage(error.message);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false); // Hide loading indicator after connection
        }
    };

    const fetchOwner = async (stakingContractInstance) => {
        try {
            if (!stakingContractInstance) {
                throw new Error("Staking contract instance is not initialized.");
            }

            const owner = await stakingContractInstance.owner();
            setOwnerAddress(owner);
        } catch (error) {
            console.error("Error fetching owner:", error);
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="wallet-connect">
            {loading ? (
                <p>Loading...</p>
            ) : walletAddress ? (
                <p>Connected: {walletAddress}</p>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}
        </div>
    );
}

export default WalletConnect;
