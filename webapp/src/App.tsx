import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Header from "./app/components/Header/Header";
import { useDeployTokenSlice } from "./app/components/Launchpad/deploy.slice";
import AppScreen from "./app/containers/AppScreen";
import HomePage from "./app/containers/HomePage";
import UserDashBoard from "./app/containers/UserDashboard";
import useMetamaskProvider from "./app/customHooks/useMetamaskProvider";
import {
  resetFactory,
  useFactorySlice,
} from "./app/slice/factory/factory.slice";
import { useWalletSlice } from "./app/slice/wallet.slice";
import { routes } from "./utils/routes";

import "./App.scss";

function App() {
  useWalletSlice();
  useFactorySlice();
  useDeployTokenSlice();

  const { detectNetworkChange } = useMetamaskProvider();
  const dispatch = useDispatch();

  useEffect(() => {
    const removeListener = detectNetworkChange();
    dispatch(resetFactory());

    return removeListener;
    // For detectNetwork change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path={routes.homepage} element={<HomePage />} />
          <Route path={routes.dashboard} element={<AppScreen />} />
          <Route path={routes.portfolio} element={<UserDashBoard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
