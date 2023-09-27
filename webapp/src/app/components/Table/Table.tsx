import { Link } from "react-router-dom";
import { Table, Button, Empty } from "antd";
import { TableComponentProps } from "./interfaces";
import { routes } from "../../../utils/routes"

import "./index.scss";

const TableComponent = ({
  columns,
  dataSource,
  classname,
}: TableComponentProps) => {
  const renderEmpty = () => (
    <Empty
      description={
        classname === "deployed-token-table"
          ? "No tokens deployed"
          : "No claimable tokens"
      }
    >
      {classname === "deployed-token-table" && (
        <Link to={routes.dashboard}>
          <Button type="primary">Deploy Now</Button>
        </Link>
      )}
    </Empty>
  );

  return (
    <div>
      {dataSource && dataSource.length ? (
        <Table
          dataSource={dataSource}
          columns={columns}
          scroll={{ x: true, y: 220 }}
          pagination={false}
          className={classname}
        />
      ) : (
        <Table
          dataSource={dataSource}
          columns={columns}
          locale={{ emptyText: renderEmpty() }}
          pagination={false}
          className={classname}
        />
      )}
    </div>
  );
};

export default TableComponent;
