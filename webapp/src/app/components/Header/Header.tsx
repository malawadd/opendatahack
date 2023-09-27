import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Dropdown } from "antd";

import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import {
  CurvXLogo,
  DisconnectIcon,
  WalletIcon,
} from "../../../assets/images/imageAssets";
import { chainList } from "../../../utils/constants";
import { formatWalletAddress } from "../../../utils/methods";
import { routes } from "../../../utils/routes";
import useMetamaskProvider from "../../customHooks/useMetamaskProvider";
import { selectNetwork, selectWallet, selectWalletConnected } from "../../slice/wallet.selector";
import { resetWallet } from "../../slice/wallet.slice";

import "./index.scss";

type Network = {
  name: string;
  className: string;
};

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { connectWallet, connected } = useMetamaskProvider();
  const { dashboard, portfolio, homepage } = routes;
  const { mainnet, testnet } = chainList;

  const networkId = useSelector(selectNetwork);
  const address = useSelector(selectWallet);
  const walletConnected = useSelector(selectWalletConnected);

  const handleConnectWallet = async () => {
    connectWallet();
  };

  const handleDisconnect: MenuProps["onClick"] = (e) => {
    if (e.key) {
      dispatch(resetWallet());
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Disconnect Wallet",
      icon: <img src={DisconnectIcon} alt="Disconnect-wallet" />,
    },
  ];

  const network: Network = {
    name: "",
    className: "",
  };

  switch (networkId) {
    case mainnet:
      network.className = "mainnet";
      network.name = "Mainnet";
      break;
    case testnet:
      network.className = "testnet";
      network.name = "Testnet";
      break;
    default:
      break;
  }

  return (
    <div
      className={`header ${location.pathname === homepage ? "header-landing-page" : ""
        }`}
    >
      <div>
        <Link style={{ textDecoration: "none" }} to={homepage}>
          <img className="logo" src={CurvXLogo} alt="CurveX_Logo" />
        </Link>
      </div>
      <div className="nav-items">
        {location.pathname === homepage ? (
          <>
            <a href="https://testtoken-delta.vercel.app/" target="blank" style={{ textDecoration: "none", color: "#ffffff" }} rel="noreferrer">Mint Test token</a>
            <div>About</div>
            <div>
              <Link style={{ textDecoration: "none" }} to={dashboard}>
                <Button className="try-btn">Try the app</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="nav-items">
            <div className="network">
              <div className={`dot ${network.className}`}></div>
              <p className="name">{network.name}</p>
            </div>
            {location.pathname === dashboard ? (
              <Link
                style={{ textDecoration: "none", color: "#ffffff" }}
                to={portfolio}
              >
                <div>{walletConnected ? "Portfolio" : ""}</div>
              </Link>
            ) : (
              <Link
                style={{ textDecoration: "none", color: "#ffffff" }}
                to={dashboard}
              >
                <div>Dashboard</div>
              </Link>
            )}
            {connected && address ? (
              <Dropdown
                menu={{ items, onClick: handleDisconnect }}
                placement="bottom"
              >
                <Button className="connect-btn" onClick={handleConnectWallet}>
                  <img
                    className="connect-icon"
                    src={WalletIcon}
                    alt="wallet-group"
                  />
                  {formatWalletAddress(address)}
                  <DownOutlined />
                </Button>
              </Dropdown>
            ) : (
              <Button className="connect-btn" onClick={handleConnectWallet}>
                <img
                  className="connect-icon"
                  src={WalletIcon}
                  alt="wallet-group"
                />
                Connect Wallet
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
