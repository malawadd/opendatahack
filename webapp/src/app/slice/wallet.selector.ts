import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../types/RootState";
import { walletInitialState } from "./wallet.slice";

const stateValue = (state: RootState) => state?.wallet || walletInitialState;

export const selectWallet = createSelector([stateValue], (state) => {
  return state.address;
});

export const selectNetwork = createSelector([stateValue], (state) => {
  return state.network;
});

export const selectWalletConnected = createSelector([stateValue], (state) => {
  return state.isConnected;
});
