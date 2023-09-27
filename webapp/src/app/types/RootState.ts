import { FactoryState } from "../slice/factory/factory.slice";
import { WalletState } from "../slice/wallet.slice";
import { DeployTokenState } from "../components/Launchpad/deploy.slice";

export interface RootState {
  wallet: WalletState;
  factory: FactoryState;
  deployToken: DeployTokenState;
}
