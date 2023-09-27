import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useInjectReducer } from "redux-injectors";

export type WalletState = {
  address: string;
  network: string;
  isConnected: boolean;
};

export const walletInitialState: WalletState = {
  address: "",
  network: "",
  isConnected: false,
};

export const WalletSlice = createSlice({
  name: "wallet",
  initialState: walletInitialState,
  reducers: {
    setWallet(state, action: PayloadAction<string>) {
      state.address = action.payload;
      state.isConnected = true;
    },
    setNetwork(state, action: PayloadAction<string>) {
      state.network = action.payload;
    },
    resetWallet(state) {
      state.isConnected = walletInitialState.isConnected;
      state.address = walletInitialState.address;
      state.network = walletInitialState.network;
    },
  },
});

export const { setWallet, setNetwork, resetWallet } = WalletSlice.actions;

export const walletReducer = WalletSlice.reducer;

export const useWalletSlice = () => {
  useInjectReducer({
    key: WalletSlice.name,
    reducer: walletReducer,
  });

  return { actions: WalletSlice.actions };
};
