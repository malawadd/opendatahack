import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useInjectReducer } from "redux-injectors";
import { TokenPairStruct } from "../../../utils/types";
import { TokenDetails } from "../../components/PriceCard/service";

export type FactoryState = {
  loading: boolean;
  loaded: boolean;
  tokenList: TokenPairStruct[];
  currentTokenDetails?: TokenDetails;
  TokenAmount?: number;
};

export const factoryInitialState: FactoryState = {
  loading: false,
  loaded: false,
  tokenList: [],
};

export const factorySlice = createSlice({
  name: "factory",
  initialState: factoryInitialState,
  reducers: {
    setTokenList(state, action: PayloadAction<TokenPairStruct[]>) {
      state.loading = false;
      state.loaded = true;
      state.tokenList = action.payload;
    },
    setLoadingList(state) {
      state.loading = true;
    },
    resetFactory(state) {
      state.loaded = factoryInitialState.loaded;
      state.loading = factoryInitialState.loading;
      state.tokenList = factoryInitialState.tokenList;
    },
    setCurrentTokenDetails(state, action: PayloadAction<TokenDetails>) {
      state.currentTokenDetails = action.payload;
    },
    setAmountOfToken(state, action: PayloadAction<number>) {
      state.TokenAmount = action.payload;
    },
  },
});

export const {
  setTokenList,
  resetFactory,
  setLoadingList,
  setCurrentTokenDetails,
  setAmountOfToken,
} = factorySlice.actions;

export const factoryReducer = factorySlice.reducer;

export const useFactorySlice = () => {
  useInjectReducer({
    key: factorySlice.name,
    reducer: factoryReducer,
  });

  return { actions: factorySlice.actions };
};
