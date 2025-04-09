import { Avatar, Card, Space, Typography } from "antd";
import { TeamOutlined } from "@ant-design/icons";
const { Title } = Typography;
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

export default function CardUserOverview({ userList }) {
  const students = userList?.students?.length || 1;
  const tutors = userList?.tutors?.length || 1;
  const users = students + tutors || 1;
  const data = [
    {
      students,
      tutors,
      users,
    },
  ];
  return (
    <Card
      title={
        <Space size="middle" align="center">
          <Title level={5} style={{ color: "#4a586b", margin: 0 }}>
            Users
          </Title>
        </Space>
      }
      style={{ flex: 1 }}
      extra={
        <Avatar
          shape="square"
          icon={<TeamOutlined />}
          style={{
            backgroundColor: "#f1f5f9",
            color: "#4a586b",
          }}
        />
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart width="100%" height="100%" data={data} margin={{ left: -40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="students"
            fill="#8884d8"
            activeBar={<Rectangle fill="white" stroke="#8884d8" />}
          />
          <Bar
            dataKey="tutors"
            fill="#82ca9d"
            activeBar={<Rectangle fill="white" stroke="#82ca9d" />}
          />
          <Bar
            dataKey="users"
            fill="#87cefa"
            activeBar={<Rectangle fill="white" stroke="#87cefa" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const dataItem = payload[0].payload; // 📌 Truy cập vào object data

//     return (
//       <Card size="small">
//         <Flex vertical gap="small">
//           <Text>Quantity: {dataItem.quantity}</Text>
//         </Flex>
//       </Card>
//     );
//   }
//   return null;
// };
