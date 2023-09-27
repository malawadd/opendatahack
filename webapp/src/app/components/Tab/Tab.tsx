import { Tabs } from "antd";
import { tabOptions } from "./constants";

import "./index.scss";

const Tab = ({ onTabChange }: { onTabChange: any }) => {
  return (
    <Tabs
      defaultActiveKey="launchpad"
      centered
      onChange={onTabChange}
      items={tabOptions.map((Item) => {
        return {
          label: (
            <span className="icon">
              <Item.Icon />
              {Item.label}
            </span>
          ),
          key: Item.key,
        };
      })}
    />
  );
};

export default Tab;
