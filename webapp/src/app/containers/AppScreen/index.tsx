import { useState } from "react";
import Tab from "../../components/Tab/Tab";
import { tabOptions } from "../../components/Tab/constants";
import BuyWihdraw from "../../components/Buy-Withdraw";
import LaunchPad from "../../components/Launchpad";

import "./index.scss";

const AppScreen = () => {
  const [selectedTab, setSelectedTab] = useState(tabOptions[0].key);

  const onTabChange = (e: string) => {
    setSelectedTab(e);
  };

  return (
    <div className="main-container">
      <div className="tab">
        <Tab {...{ onTabChange }} />
      </div>
      {selectedTab === tabOptions[0].key && <LaunchPad />}
      {selectedTab === tabOptions[1].key && <BuyWihdraw tab="Buy" />}
      {selectedTab === tabOptions[2].key && <BuyWihdraw tab="Withdraw" />}
    </div>
  );
};

export default AppScreen;
