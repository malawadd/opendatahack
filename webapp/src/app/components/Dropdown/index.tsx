import { Form, Select } from "antd";
import { memo } from "react";

import "./index.scss";

const Option = Select.Option;

export type DropdownOptions = {
  value: string;
  label: string;
  icon: string;
};

export type DropdownProps = {
  name?: string;
  placeholder?: string;
  options: DropdownOptions[];
  loading?: boolean;
  disabled: boolean;
};

const CustomOption = memo(
  ({ label, icon }: { label: string; icon: string }) => (
    <div>
      <img src={icon} alt={label} className="option-icon" />
      {label}
    </div>
  )
);

const DropDown = (props: DropdownProps) => {
  const { name, options, placeholder, loading, disabled } = props;

  return (
    <div className="dropdown">
      <Form.Item name={name} noStyle>
        <Select
          className="select-input"
          placeholder={placeholder}
          loading={loading}
          disabled={disabled}
        >
          {options.map((token) => (
            <Option key={token.value} value={token.value}>
              <CustomOption label={token.label} icon={token.icon} />
            </Option>
          ))}
        </Select>
      </Form.Item>
    </div>
  );
};

export default memo(DropDown);
