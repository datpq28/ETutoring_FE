import { Avatar, Card, Flex, Space, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
];

export default function CardOverview({
  iconCard = <TeamOutlined />,
  titleCard = "Students",
}) {
  return (
    <Card
      title={
        <Space size="middle" align="center">
          <Title level={5} style={{ color: "#4a586b", margin: 0 }}>
            {titleCard}
          </Title>
        </Space>
      }
      style={{ flex: 1 }}
      extra={
        <Avatar
          shape="square"
          icon={iconCard}
          style={{
            backgroundColor: "#f1f5f9",
            color: "#4a586b",
          }}
        />
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          width="100%"
          height="100%"
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="pv"
            fill="#8884d8"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="uv"
            fill="#82ca9d"
            activeBar={<Rectangle fill="gold" stroke="purple" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataItem = payload[0].payload; // 📌 Truy cập vào object data

    return (
      <Card size="small">
        <Flex vertical gap="small">
          <Text>Quantity: {dataItem.quantity}</Text>
        </Flex>
      </Card>
    );
  }
  return null;
};
