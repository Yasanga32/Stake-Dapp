// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20Staking {
    IERC20 public stakingToken;
    address public owner;

    struct Stake {
        uint amount;
        uint startTime;
        uint lockPeriod;
        uint rewardRate;
        bool withdrawn;
    }

    mapping(address => Stake[]) public stakes;

    event Staked(address indexed user, uint amount, uint lockPeriod, uint rewardRate);
    event Withdrawn(address indexed user, uint amount, uint rewardAmount);

    constructor(IERC20 _stakingToken) {
        stakingToken = _stakingToken;
        owner = msg.sender;
    }

    function stake(uint _amount, uint _lockPeriod) external {
        require(_amount > 0, "Invalid amount");

        uint rewardRate;
        if (_lockPeriod == 30) {
            rewardRate = 7;
        } else if (_lockPeriod == 60) {
            rewardRate = 9;
        } else if (_lockPeriod == 90) {
            rewardRate = 12;
        } else {
            revert("Invalid lock period");
        }

        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        stakes[msg.sender].push(Stake({
            amount: _amount,
            startTime: block.timestamp,
            lockPeriod: _lockPeriod * 1 days,
            rewardRate: rewardRate,
            withdrawn: false
        }));

        emit Staked(msg.sender, _amount, _lockPeriod, rewardRate);
    }

    function withdraw(uint index) external {
        require(index < stakes[msg.sender].length, "Invalid index");
        Stake storage userStake = stakes[msg.sender][index];

        require(!userStake.withdrawn, "Already withdrawn");
        require(block.timestamp >= userStake.startTime + userStake.lockPeriod, "Lock period not over");

        uint rewardAmount = (userStake.amount * userStake.rewardRate) / 100;
        uint totalAmount = userStake.amount + rewardAmount;

        userStake.withdrawn = true;

        require(stakingToken.transfer(msg.sender, totalAmount), "Transfer failed");

        emit Withdrawn(msg.sender, userStake.amount, rewardAmount);
    }

    function getStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }

    function contractBalance() external view returns (uint) {
        return stakingToken.balanceOf(address(this));
    }
}
