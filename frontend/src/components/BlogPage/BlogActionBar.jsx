import { DiffOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, Segmented, Select, Space } from "antd";
import { useState } from "react";

const optionsSearch = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "title",
    label: "Title",
  },
  {
    value: "tags",
    label: "Tags",
  },
];

const userOptions = [
  {
    value: "all_blogs",
    label: "All Blogs",

    icon: <TeamOutlined />,
  },
  {
    value: "my_blogs",
    label: "My Blogs",
    icon: <UserOutlined />,
  },
];

export default function BlogActionBar({
  onChangeUserSegmented,
  onChangeOptionSearch,
  onChangeSearchValue,
  onOpenModalActions,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [optionSearch, setOptionSearch] = useState(optionsSearch[0].value);
  const [userSegmented, setUserSegmented] = useState(userOptions[0].value);

  const handleChangeOptionSearch = (value) => {
    setOptionSearch(value);
    onChangeOptionSearch(value);
  };

  const handleChangeUserSegmented = (value) => {
    setUserSegmented(value);
    onChangeUserSegmented(value);
  };

  const handleChangeSearchValue = (e) => {
    setSearchValue(e.target.value);
    onChangeSearchValue(e.target.value);
  };
  console.log(searchValue);
  return (
    <Card>
      <Flex gap="middle" justify="space-between" wrap>
        <Space.Compact style={{ width: "50rem" }}>
          <Select
            style={{ width: "12rem" }}
            value={optionSearch}
            options={optionsSearch}
            onChange={handleChangeOptionSearch}
          />
          <Input
            placeholder="Search Blog"
            value={searchValue}
            onChange={handleChangeSearchValue}
          />
        </Space.Compact>
        <Flex gap="middle" wrap>
          <Button onClick={() => onOpenModalActions(true)} type="primary">
            <Space size="small" align="center">
              <DiffOutlined />
              Post New Blog
            </Space>
          </Button>
          <Segmented
            options={userOptions}
            value={userSegmented}
            onChange={handleChangeUserSegmented}
          />
        </Flex>
      </Flex>
    </Card>
  );
}
