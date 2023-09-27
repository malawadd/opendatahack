/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { AnyAction, combineReducers } from "@reduxjs/toolkit";
import { Reducer } from "react";

/**
 * Merges the main reducer with the router state and
 * dynamically injected reducers
 */
export function createReducer(injectedReducers = {}) {
  // Initially we don't have any injectedReducers,
  // so returning identity function to avoid the error
  if (Object.keys(injectedReducers).length === 0) {
    return (state: any) => state;
  }

  return combineReducers({
    ...injectedReducers,
  }) as Reducer<any, AnyAction>;
}
