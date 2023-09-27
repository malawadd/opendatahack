import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../types/RootState";
import { factoryInitialState } from "./factory.slice";

const stateValue = (state: RootState) => state?.factory || factoryInitialState;

export const selectFactoryLoading = createSelector([stateValue], (state) => {
  return state.loading;
});

export const selectFactoryLoaded = createSelector([stateValue], (state) => {
  return state.loaded;
});

export const selectFactoryTokenList = createSelector([stateValue], (state) => {
  return state.tokenList;
});

export const selectCurrentTokenDetails = createSelector(
  [stateValue],
  (state) => {
    return state.currentTokenDetails;
  }
);

export const selectTokenAmount = createSelector([stateValue], (state) => {
  return state.TokenAmount;
});
