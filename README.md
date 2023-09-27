# munhna
 

  
  
<h1 align="center">
  <br>
  <a href=""><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgv3e4USmiIcs2SGeMxWesP1wB9kp6XWDWlFAhji8Q28T-_x0TmlhzkU7bZAE_JR9WOzokcnzGk6oQwPMPSDBzZD8m8upiT_aky_mksBvofeKsTsrlRvRtC3XuqKhbSOrSqGfunbiRl4sQdJGpTRkUYFYrCi7oLR2vqRPmzTm8c8pklBSBILkhAaPv7JA0/s945/paper2.png" width="300"></a>
  <br>
  Munhna 
  <br>
</h1>

<h4 align="center">Embark on a New Era of Token Issuance Tailored for DataDaos within the Filecoin Ecosystem. </h4>

<p align="center">
  <a href="#introduction">Introduction</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#local-deployment">Local deployment</a> •
  <a href="#munhna-bounding-curves">Munhna bounding curves</a> •
  <a href="#credits ">Credits </a> •
  <a href="#demo ">Video Demo </a> •
  <a href="#contract-address ">Contract Address  </a> •
  <a href="#license">License</a>
</p>

![screenshot](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiCKYvaAvqhdifMmQE3rMiIQcpIJdHRYoylnWks0mqZCJ3WHcBzKtZHDUk_Z049ymZUaIu4W8SVXZNI0405wlocAbXW606fEC__lOyssuBT2HlBVvBBWsj6L7IP_ZOjzIlg6zL2ylYOJrMu95cOaTYXnJqKMcgUUcNJKGN-hG_TzfxHoaO9XjfQiBk96J4/s1000/Untitled-1.png)


## Introduction 

 Welcome to the realm where your token issuance strategies align seamlessly with your DataDao objectives, all within the robust

## Key Features

Key Features of Beam :

1. **Customizable Token Economics:** Tailor the core of token economics by adjusting bonding curve parameters to mirror your token issuance strategies.



2. **Support for different types of bonding curves:** Choose from a plethora of bonding curve options to match your specific tokenomics and project aspirations.


3. **Token-Vesting:** Unlock benefits tied to token appreciation throughout the lock-up period, paving the way for potential higher sell rates post-lockup.

4. **Efficient Price Discovery:** Elevate transparency with a bonding curve algorithm that accurately reflects the token's current value, guiding more informed trading decisions.



## Usage
Unleash The Power Of Curves: Discover The Range Of Options At Your Fingertips!

Find the Perfect Curve, Fit for Your DATADAO Token Economics and Project Goals

## Local deployment

1. in the webapp directory run yarn to procced with installing all the packages

    ```bash
    yarn 
    ```

2. fill the env variables required in **.env.example** file. 
3. run the local dev app

    ```bash
    yarn start 
    ```

## Munhna bounding curves

**Bonding curves** are mathematical functions that establish a relationship between the price of a token and its supply. They play a crucial role in decentralized finance (DeFi) and token economics by providing a mechanism for determining token prices based on supply and demand dynamics. Different types of bonding curves, such as linear, polynomial, sub-linear, and S-curve, offer unique price dynamics and serve specific purposes.


One of the key benefits of bonding curves is that they enable token issuance and investment without the need for collateral. Users can purchase tokens directly from the curve, and the price dynamically adjusts based on the token's supply. This eliminates the requirement for external liquidity sources and centralized exchanges, facilitating continuous trading and liquidity provision. Additionally, bonding curves provide an opportunity to pump the value of tokens as demand increases. By attracting more buyers, the price of the tokens can rise, creating profit potential for early adopters.

### Linear Curve
Experience the straightforward elegance of our Linear Bonding Curve, where the token price rises or falls in a linear fashion as the token supply increases or decreases. With a simple formula in play, you can rely on a pricing mechanism that offers transparency and predictability, keeping your project on a stable and consistent path.

### Polynomial Curve
Unlock the power of the Polynomial Curve, where token pricing takes on a captivating curved path driven by a versatile formula. With the Polynomial Curve, your token's value can experience exponential growth, controlled fluctuations, or tailored trajectories based on the values assigned to the coefficients (a, b, c, d) and powers (n) in the formula. This flexibility enables you to create unique token economics that aligns with your project's vision.


## Credits

Munhna uses the following open source packages:

- [hardhat](https://hardhat.org/) Ethereum development environment for professionals


- [react.js](https://react.dev/) React lets you build user interfaces out of individual pieces called components. Create your own React components like Thumbnail, LikeButton, and Video. Then combine them into entire screens, pages, and apps.

- [https://opbnb.bnbchain.org/en](https://opbnb.bnbchain.org/en)  An Optimized Layer-2 Solution That Delivers Lower Fees And Higher Throughput To Unlock The Full Potential Of The BNB Chain

- [chart.js](https://www.chartjs.org/) Simple yet flexible JavaScript charting library for the modern web.


- [use-metamask](https://github.com/mdtanrikulu/use-metamask)An awesome React Hook to jumpstart your projects!


- [typescript](https://www.typescriptlang.org/) TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

- [nft.storag](https://nft.storage/) Free decentralized storage and bandwidth for NFTs on  IPFS and  Filecoin.

## Demo

https://youtu.be/-NC0ClMOBp0

## Contract Address 

- Munhna Factory : [0x3553826535d149c9a4441f8928847970c05e8115](https://fvm.starboard.ventures/calibration/explorer/address/0x3553826535d149c9a4441f8928847970c05e8115)

- Munhna Token : [0xB11011307e0F3c805387c10aa69F874244b1bec3](https://fvm.starboard.ventures/calibration/explorer/address/0xB11011307e0F3c805387c10aa69F874244b1bec3)

## License

MIT
