import { ethers, run } from "hardhat";

async function main() {
  const MunhnaFactory = await ethers.getContractFactory("MunhnaFactory");
  const fManager = await ethers.getContractFactory("BondingMunhna");
  const fMunhna = await ethers.getContractFactory("Munhna_ERC20");

  const factory = MunhnaFactory.attach(
    // Factory contract address from testnet
    "0x16de95d9199Fceb3546565909eB52a4726B14311"
  );

  const tx = await (
    await factory.deployMunhna(
      "OPENDATAHACK",
      "OPENDATAHACK",
      "MUN.com",
      ethers.utils.parseEther("1000000"),
      1,
      100,
      1,
      "0xB11011307e0F3c805387c10aa69F874244b1bec3",
      ethers.utils.solidityKeccak256(
        ["uint256"],
        [Math.round(Math.random() * 10000)]
      )
    )
  ).wait();

  console.log("Token deployed");
  console.log("tx hash: ", tx.transactionHash);

  const tokenList = await factory.getTokenPairList();
  const tokenManager = tokenList[tokenList.length - 1].tokenManager;
  const tokenAAddress = tokenList[tokenList.length - 1].tokenA;
  const tokenBAddress = tokenList[tokenList.length - 1].tokenB;

  const tokenA = fMunhna.attach(tokenAAddress);
  const manager = fManager.attach(tokenManager);

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
