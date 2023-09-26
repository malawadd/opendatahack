import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import factoryMock from "./mock/MunhnaFactory.mock";

const AddZero = ethers.constants.AddressZero;

describe("Linear curve - Token Manager - BondingMunhna.sol", function () {
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

    const usdt = await erc20.deploy(factoryMock.usdt, factoryMock.usdt);

    const DECIMALS = ethers.utils.parseEther("1");

    await usdt.mint(owner.address, DECIMALS);
    await usdt.mint(addr1.address, DECIMALS);
    await usdt.mint(addr2.address, DECIMALS);

    await factory.deployMunhna(
      factoryMock.tokenName,
      factoryMock.tokenSymbol,
      factoryMock.logoUri,
      factoryMock.cap,
      factoryMock.lockPeriod,
      factoryMock.precision,
      factoryMock.curveType,
      usdt.address,
      factoryMock.salt
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

    const buyAmount = DECIMALS;
    const spendAmount = buyAmount.pow(2).div(2).div(DECIMALS).div(PRECISION);

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
    const spendAmount = buyAmount.pow(2).div(2).div(DECIMALS).div(PRECISION);

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, spendAmount)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(buyAmount)).not.to.be.reverted;

    await time.increase(factoryMock.lockPeriod + 10);

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
    const { tokenA, tokenB, tokenManager, addr1, DECIMALS } = await loadFixture(
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
    const spendAmount = buyAmount.pow(2).div(2).div(DECIMALS).div(PRECISION);

    await expect(
      tokenB.connect(addr1).approve(tokenManager.address, spendAmount)
    ).not.to.be.reverted;

    await expect(tokenManager.connect(addr1).buy(buyAmount.div(2))).not.to.be
      .reverted;
    await expect(tokenManager.connect(addr1).buy(buyAmount.div(2))).not.to.be
      .reverted;

    await time.increase(factoryMock.lockPeriod + 10);

    await expect(tokenA.connect(addr1).unlock()).not.to.be.reverted;

    const tokenToSell = buyAmount;
    const expectedTokenReturns = spendAmount;

    await expect(tokenManager.connect(addr1).sell(tokenToSell))
      .to.emit(tokenB, "Transfer")
      .withArgs(tokenManager.address, addr1.address, expectedTokenReturns)
      .to.emit(tokenA, "Transfer")
      .withArgs(addr1.address, AddZero, tokenToSell);
  });
});
