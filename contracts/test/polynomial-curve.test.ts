import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import mock from "./mock/polynomial.mock";

const AddZero = ethers.constants.AddressZero;

describe("Polynomial - Token Manager - BondingMunhna.sol", function () {
  after(async () => {
    await network.provider.request({
      method: "hardhat_reset",
    });
  });

  async function deployTokenFixture() {
    const Factory = await ethers.getContractFactory("MunhnaFactory");
    const Munhna = await ethers.getContractFactory("Munhna_ERC20");
    const BondingMunhna = await ethers.getContractFactory("BondingMunhna");
    const erc20 = await ethers.getContractFactory("ERC20PresetMinterPauser");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const factory = await Factory.deploy();
    await factory.deployed();

    const usdt = await erc20.deploy(mock.usdt, mock.usdt);

    const DECIMALS = ethers.utils.parseEther("1");

    await usdt.mint(owner.address, mock.cap);
    await usdt.mint(addr1.address, mock.cap);
    await usdt.mint(addr2.address, mock.cap);

    await factory.deployMunhna(
      mock.tokenName,
      mock.tokenSymbol,
      mock.logoUri,
      mock.cap,
      mock.lockPeriod,
      mock.precision,
      mock.curveType,
      usdt.address,
      mock.salt
    );

    const contractAddress = (await factory.getTokenPairList())[0];

    const tokenManager = BondingMunhna.attach(contractAddress.tokenManager);
    const tokenA = Munhna.attach(contractAddress.tokenA);
    const tokenB = erc20.attach(contractAddress.tokenB);

    const PRECISION = await tokenManager.CURVE_PRECISION();

    return {
      owner,
      addr1,
      addr2,
      tokenA,
      tokenB,
      tokenManager,
      contractAddress,
      DECIMALS,
      PRECISION,
    };
  }

  it("should have token A, token B and token Manager", async () => {
    const { tokenA, tokenB, contractAddress, tokenManager } = await loadFixture(
      deployTokenFixture
    );

    expect(tokenA.address).to.be.equal(contractAddress.tokenA);
    expect(tokenB.address).to.be.equal(contractAddress.tokenB);
    expect(tokenManager.address).to.be.equal(contractAddress.tokenManager);
  });

  it("should be able to mint token from token manager", async () => {
    const { tokenA, tokenB, tokenManager, addr1, DECIMALS, PRECISION } =
      await loadFixture(deployTokenFixture);

    const buyAmount = DECIMALS.mul(10000000);
    const spendAmount = buyAmount
      .pow(3)
      .div(3)
      .div(PRECISION)
      .div(DECIMALS.pow(2));

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, spendAmount)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(buyAmount))
      .to.emit(tokenA, "Transfer")
      .withArgs(AddZero, addr1.address, buyAmount)
      .to.emit(tokenB, "Transfer")
      .withArgs(addr1.address, tokenManager.address, spendAmount);
  });

  it("should be able to sell the minted tokens after unlocking them", async () => {
    const { tokenA, tokenB, tokenManager, addr1, DECIMALS, PRECISION } =
      await loadFixture(deployTokenFixture);

    const buyAmount = DECIMALS;
    const spendAmount = buyAmount
      .pow(3)
      .div(3)
      .div(PRECISION)
      .div(DECIMALS.pow(2));

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, spendAmount)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(buyAmount)).not.to.be.reverted;

    await time.increase(mock.lockPeriod + 10);

    await expect(tokenA.connect(addr1).unlock()).not.to.be.reverted;

    const tokenToSell = buyAmount;
    const expectedTokenReturns = spendAmount;

    await expect(tokenManager.connect(addr1).sell(tokenToSell))
      .to.emit(tokenB, "Transfer")
      .withArgs(tokenManager.address, addr1.address, expectedTokenReturns)
      .to.emit(tokenA, "Transfer")
      .withArgs(addr1.address, AddZero, tokenToSell);
  });

  it("should be able mint tokens immediately after minting", async () => {
    const { tokenB, tokenManager, addr1 } = await loadFixture(
      deployTokenFixture
    );

    const tokensToSpend = 10;

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, tokensToSpend)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(tokensToSpend)).not.to.be
      .reverted;

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, tokensToSpend)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(tokensToSpend)).not.to.be
      .reverted;
  });

  it("should be able sell tokens immediately after selling", async () => {
    const { tokenA, tokenB, tokenManager, addr1, DECIMALS, PRECISION } =
      await loadFixture(deployTokenFixture);

    const buyAmount = DECIMALS;
    const spendAmount = buyAmount
      .pow(3)
      .div(3)
      .div(PRECISION)
      .div(DECIMALS.pow(2));

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, spendAmount)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(buyAmount)).not.to.be.reverted;

    await time.increase(mock.lockPeriod + 10);

    const tokenToSell = buyAmount.div(2);
    const tokenToSell2 = buyAmount.div(2);

    const sellTotalSupplyPoolBalance = tokenToSell
      .pow(3)
      .div(3)
      .div(PRECISION)
      .div(DECIMALS.pow(2));
    const sell1Return = spendAmount.sub(sellTotalSupplyPoolBalance);
    const sell2Return = spendAmount.sub(sell1Return);

    await expect(tokenA.connect(addr1).unlock()).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).sell(tokenToSell))
      .to.emit(tokenB, "Transfer")
      .withArgs(tokenManager.address, addr1.address, sell1Return)
      .to.emit(tokenA, "Transfer")
      .withArgs(addr1.address, AddZero, tokenToSell);

    await expect(tokenManager.connect(addr1).sell(tokenToSell2))
      .to.emit(tokenB, "Transfer")
      .withArgs(tokenManager.address, addr1.address, sell2Return)
      .to.emit(tokenA, "Transfer")
      .withArgs(addr1.address, AddZero, tokenToSell2);
  });
});
