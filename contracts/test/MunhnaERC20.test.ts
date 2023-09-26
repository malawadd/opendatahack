import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import mock from "./mock/MunhnaERC20.mock";

describe("Token contract", function () {
  after(async () => {
    await network.provider.request({
      method: "hardhat_reset",
    });
  });

  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Munhna_ERC20");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const oneEther = ethers.utils.parseEther("1");

    const Munhna = await Token.deploy(
      mock.tokenName,
      mock.tokenSymbol,
      mock.cap,
      mock.lockPeriod
    );

    await Munhna.deployed();

    await Munhna.grantRole(Munhna.TOKEN_MANAGER_ROLE(), owner.address);

    return {
      Token,
      Munhna,
      owner,
      addr1,
      addr2,
      oneEther,
      CAP: mock.cap,
      oneMonth: mock.lockPeriod,
      tokenName: mock.tokenName,
      tokenSymbol: mock.tokenSymbol,
    };
  }

  describe("Deployment", function () {
    it("Should not deploy if name is empty or more than 64 characters", async function () {
      const { Token, CAP, oneMonth, tokenSymbol } = await loadFixture(
        deployTokenFixture
      );

      await expect(Token.deploy("", tokenSymbol, CAP, oneMonth))
        .to.be.revertedWithCustomError(Token, "TokenNameLengthOutOfRange")
        .withArgs(1, 64);

      await expect(Token.deploy("a".repeat(65), tokenSymbol, CAP, oneMonth))
        .to.be.revertedWithCustomError(Token, "TokenNameLengthOutOfRange")
        .withArgs(1, 64);
    });

    it("Should not deploy if symbol is empty or more than 64 characters", async function () {
      const { Token, CAP, oneMonth, tokenName } = await loadFixture(
        deployTokenFixture
      );

      await expect(Token.deploy(tokenName, "", CAP, oneMonth))
        .to.be.revertedWithCustomError(Token, "TokenSymbolLengthOutOfRange")
        .withArgs(1, 64);

      await expect(Token.deploy("Munhna", "a".repeat(65), CAP, oneMonth))
        .to.be.revertedWithCustomError(Token, "TokenSymbolLengthOutOfRange")
        .withArgs(1, 64);
    });

    it("Should not deploy if supplyCap is zero", async function () {
      const { Token, oneMonth, tokenName, tokenSymbol } = await loadFixture(
        deployTokenFixture
      );

      await expect(Token.deploy(tokenName, tokenSymbol, 0, oneMonth))
        .to.be.revertedWithCustomError(Token, "SupplyCapOutOfRange")
        .withArgs(1, ethers.constants.MaxUint256);
    });

    it("Should not deploy if locking period is empty or 0", async function () {
      const { Token, CAP, tokenName, tokenSymbol } = await loadFixture(
        deployTokenFixture
      );

      await expect(
        Token.deploy(tokenName, tokenSymbol, CAP, 0)
      ).to.be.revertedWithCustomError(Token, "LockingPeriodZero");
    });
  });

  describe("Single mint and lock", function () {
    it("Should be total supply zero", async function () {
      const { Munhna } = await loadFixture(deployTokenFixture);

      expect(await Munhna.totalSupply()).to.equal(0);
    });

    it("Should revert if there is not any token locked in a account", async function () {
      const { Munhna } = await loadFixture(deployTokenFixture);

      await expect(Munhna.unlock()).to.be.revertedWithCustomError(
        Munhna,
        "UnlockableBalanceZero"
      );
    });

    it("Should revert if total supply exceeds supply cap", async function () {
      const { Munhna, CAP, owner } = await loadFixture(deployTokenFixture);

      await expect(Munhna.mintAndLock(owner.address, CAP)).not.to.be.reverted;

      await expect(Munhna.mintAndLock(owner.address, 1))
        .to.be.revertedWithCustomError(Munhna, "MintExceedsSupplyCap")
        .withArgs(1, 0);
    });

    it("Should mint and lock tokens", async function () {
      const { Munhna, owner } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);
    });

    it("Should prevent locked balance being transferred", async function () {
      const { Munhna, owner, addr1 } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await expect(Munhna.transfer(addr1.address, 50))
        .to.be.revertedWithCustomError(Munhna, "InsufficientUnlockedTokens")
        .withArgs(0, 50);
    });

    it("Should unlock if unlock period is reached", async function () {
      const { Munhna, owner, oneMonth } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await time.increase(oneMonth);

      expect(await Munhna.unlockableBalanceOf(owner.address)).to.be.equal(50);

      await expect(Munhna.unlock()).not.to.be.reverted;

      expect(await Munhna.lockedBalanceOf(owner.address)).to.be.equal(0);
    });

    it("Token amount should be transferable after it is unlocked", async function () {
      const { Munhna, owner, addr1, oneMonth } = await loadFixture(
        deployTokenFixture
      );

      await expect(Munhna.mintAndLock(owner.address, 50))
        .to.changeTokenBalances(Munhna, [owner], [50])
        .to.emit(Munhna, "TokenLocked")
        .withArgs(owner.address, 50);

      await time.increase(oneMonth);

      await expect(Munhna.unlock())
        .to.emit(Munhna, "TokenUnlocked")
        .withArgs(owner.address, 50).not.to.be.reverted;

      await expect(Munhna.transfer(addr1.address, 50)).to.changeTokenBalances(
        Munhna,
        [owner, addr1],
        [-50, 50]
      );
    });
  });

  describe("Multiple mint and lock", function () {
    it("Should be total supply zero", async function () {
      const { Munhna } = await loadFixture(deployTokenFixture);

      expect(await Munhna.totalSupply()).to.equal(0);
    });

    it("Should mint and lock tokens", async function () {
      const { Munhna, owner } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);
    });

    it("Should prevent locked balance being transferred", async function () {
      const { Munhna, owner, addr1 } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await expect(Munhna.transfer(addr1.address, 50))
        .to.be.revertedWithCustomError(Munhna, "InsufficientUnlockedTokens")
        .withArgs(0, 50);
    });

    it("Should unlock if unlock period is reached", async function () {
      const { Munhna, owner, oneMonth } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await time.increase(oneMonth);

      expect(await Munhna.unlockableBalanceOf(owner.address)).to.be.equal(100);

      await expect(Munhna.unlock()).not.to.be.reverted;

      expect(await Munhna.lockedBalanceOf(owner.address)).to.be.equal(0);
    });

    it("Token amount should be transferable after it is unlocked", async function () {
      const { Munhna, owner, addr1, oneMonth } = await loadFixture(
        deployTokenFixture
      );

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await time.increase(oneMonth);

      await expect(Munhna.unlock()).not.to.be.reverted;

      await expect(Munhna.transfer(addr1.address, 50)).to.changeTokenBalances(
        Munhna,
        [owner, addr1],
        [-50, 50]
      );
    });

    it("Only matured amount should be unlocked", async function () {
      const { Munhna, owner, oneMonth } = await loadFixture(deployTokenFixture);

      await expect(
        Munhna.mintAndLock(owner.address, 50)
      ).to.changeTokenBalances(Munhna, [owner], [50]);

      await time.increase(oneMonth);

      await expect(Munhna.mintAndLock(owner.address, 7)).to.changeTokenBalances(
        Munhna,
        [owner],
        [7]
      );

      expect(await Munhna.lockedBalanceOf(owner.address)).to.be.equal(57);
      expect(await Munhna.unlockableBalanceOf(owner.address)).to.be.equal(50);

      await expect(Munhna.unlock()).not.to.be.reverted;

      expect(await Munhna.lockedBalanceOf(owner.address)).to.be.equal(7);
    });
  });
});
