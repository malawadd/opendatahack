import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import mock from "./mock/MunhnaFactory.mock";

describe("Token Factory", function () {
  after(async () => {
    await network.provider.request({
      method: "hardhat_reset",
    });
  });

  async function deployTokenFixture() {
    const Factory = await ethers.getContractFactory("MunhnaFactory");
    const erc20 = await ethers.getContractFactory("ERC20");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const factory = await Factory.deploy();
    await factory.deployed();

    const usdt = await erc20.deploy(mock.usdt, mock.usdt);

    return { owner, addr1, addr2, Factory, factory, usdt };
  }

  it("should deploy token factory", async () => {
    const { factory, usdt } = await loadFixture(deployTokenFixture);
    const [manager, CurveERC20] = await Promise.all([
      ethers.getContractFactory("BondingMunhna"),
      ethers.getContractFactory("Munhna_ERC20"),
    ]);

    await expect(
      factory.deployMunhna(
        mock.tokenName,
        mock.tokenSymbol,
        mock.logoUri,
        mock.cap,
        mock.lockPeriod,
        mock.precision,
        mock.curveType,
        usdt.address,
        mock.salt
      )
    ).not.to.be.reverted;

    const tokenList = await factory.getTokenPairList();

    expect(await CurveERC20.attach(tokenList[0].tokenA).decimals()).to.be.equal(
      18
    );
    expect(tokenList[0].tokenB).to.be.equal(usdt.address);
    expect(
      await manager.attach(tokenList[0].tokenManager).munhnaType()
    ).to.be.equal(mock.curveType);
    expect(tokenList[0].logoUri).to.be.equal(mock.logoUri);
  });
});
