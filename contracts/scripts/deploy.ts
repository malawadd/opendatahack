import { ethers, run } from "hardhat";

async function main() {
  const MunhnaFactory = await ethers.getContractFactory("MunhnaFactory");
  console.log("Deployer address: ", await MunhnaFactory.signer.getAddress());

  const MunhnaDeployed = await MunhnaFactory.deploy();

  await MunhnaDeployed.deployed();

  console.log("Deployed address: ", MunhnaDeployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
