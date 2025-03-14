import React, { useState } from "react";
import { ethers } from "ethers";
import "./StakingPlans.css"; 

const StakingPlans = ({ erc20Contract, stakingContractAddress, setLockPeriod, setAmount, stakeTokens }) => {
  const [amounts, setAmounts] = useState({
    30: "",
    60: "",
    90: "",
  });
  const [isApproved, setIsApproved] = useState(false);

  const plans = [
    { id: 1, name: "Plan 1 (30 Days)", rewardRate: "7%", duration: 30 },
    { id: 2, name: "Plan 2 (60 Days)", rewardRate: "9%", duration: 60 },
    { id: 3, name: "Plan 3 (90 Days)", rewardRate: "12%", duration: 90 },
  ];

  const approveTokens = async (amount) => {
    if (!erc20Contract || !amount) return alert("Enter an amount and connect wallet first");

    try {
      const tx = await erc20Contract.approve(stakingContractAddress, ethers.parseUnits(amount, 18));
      await tx.wait();
      setIsApproved(true); // Mark tokens as approved
      alert("Approval successful!");
    } catch (error) {
      console.error(error);
      alert("Approval failed");
    }
  };

  // Handle amount change
  const handleAmountChange = (e, planDuration) => {
    const newAmount = e.target.value;
    setAmounts({
      ...amounts,
      [planDuration]: newAmount, // Update the specific plan's amount
    });
    setAmount(newAmount); // Pass amount to parent component
    setIsApproved(false); // Reset approval status when amount changes
  };

  // Handle staking
  const stakeTokensForPlan = async (lockPeriod) => {
    const amountForPlan = amounts[lockPeriod]; // Use the amount for the current plan
    if (!isApproved) {
      return alert("You must approve the tokens first");
    }
    // Proceed with staking logic here (you need to implement staking logic)
    await stakeTokens(); // Call the parent's stakeTokens function to process staking
    alert(`Staked ${amountForPlan} USDT for ${lockPeriod} days with ${plans.find(plan => plan.duration === lockPeriod).rewardRate} reward rate`);
  };

  return (
    <div className="container">
      <h2 className="title">Select a Staking Plan</h2>
      <div className="plans">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="plan-card"
            onClick={() => setLockPeriod(plan.duration)}
          >
            <h3>{plan.name}</h3>
            <p>Reward Rate: {plan.rewardRate} | Duration: {plan.duration} Days</p>
            <input
              type="number"
              placeholder="Enter Amount"
              className="input-field"
              value={amounts[plan.duration]}
              onChange={(e) => handleAmountChange(e, plan.duration)} // Pass plan duration
            />
            <button className="stake-btn" onClick={() => approveTokens(amounts[plan.duration])} disabled={isApproved}>
              {isApproved ? "Approved" : "Approve Tokens"}
            </button>

            <button className="stake-btn" onClick={() => stakeTokensForPlan(plan.duration)} disabled={!isApproved}>
              STAKE USDT
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StakingPlans;
