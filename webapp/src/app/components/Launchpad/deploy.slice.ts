import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { useInjectReducer, useInjectSaga } from "redux-injectors";
import { LaunchFormData } from "./constants";
import { callDeployTokenSaga } from "./deploy.saga";

export type TransactionState = {
  message: string;
  hash: string;
};

export type DeployTokenState = {
  deployToken: {
    isLoading: boolean;
    success: {
      message: string;
      hash: string;
    };
    error: {
      message: string;
    };
  };
};

export const deployTokenInitialState: DeployTokenState = {
  deployToken: {
    isLoading: false,
    success: {
      message: "",
      hash: "",
    },
    error: {
      message: "",
    },
  },
};

export const deployTokenSlice = createSlice({
  name: "deployToken",
  initialState: deployTokenInitialState,
  reducers: {
    deployToken: (
      state,
      _action: PayloadAction<{
        formData: LaunchFormData;
        deployToken: any;
      }>
    ) => {
      state.deployToken.isLoading = true;
    },
    setDeployTokenSuccess: (state, action: PayloadAction<TransactionState>) => {
      state.deployToken.success.message = action.payload.message;
      state.deployToken.success.hash = action.payload.hash;
    },
    setDeployTokenError: (state, action: PayloadAction<string>) => {
      state.deployToken.error.message = action.payload;
    },
    resetTransactionState: (state) => {
      state.deployToken.success.message =
        deployTokenInitialState.deployToken.success.message;
      state.deployToken.success.hash =
        deployTokenInitialState.deployToken.success.hash;
    },
  },
});

export const {
  deployToken,
  setDeployTokenError,
  setDeployTokenSuccess,
  resetTransactionState,
} = deployTokenSlice.actions;

export const deployTokenReducer = deployTokenSlice.reducer;

export const useDeployTokenSlice = () => {
  useInjectReducer({
    key: deployTokenSlice.name,
    reducer: deployTokenReducer,
  });
  useInjectSaga({ key: deployTokenSlice.name, saga: callDeployTokenSaga });
};
