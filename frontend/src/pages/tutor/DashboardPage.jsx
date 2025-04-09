import { Flex, Layout, Typography } from "antd";
import { useEffect, useState } from "react";
import { getAllUser } from "../../../api_service/mesages_service";
import UpcomingMeetings from "../../components/tutor/DashboardPage/UpcomingMeetings";
import StudentTable from "../../components/tutor/DashboardPage/StudentTable";
import ActivitySummary from "../../components/tutor/DashboardPage/ActivitySummary";
const { Content } = Layout;
const { Title, Text } = Typography;
const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");
const DashboardPage = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      const users = await getAllUser();
      const { tutors } = users;
      const user = tutors.find((user) => user?._id === userId);
      setUser(user);
    };

    fetchUser();
  }, []);
  return (
    <Content style={stylesInline.content}>
      <Flex vertical gap="middle">
        <Flex vertical gap="middle">
          <Title level={2} style={{ margin: 0 }}>
            Tutor Dashboard
          </Title>
          <Text type="secondary" style={{ margin: 0 }}>
            Welcome back,{" "}
            <Text underline>
              {user?.firstname} {user?.lastname}
            </Text>
            . Here's what's happening with your students.
          </Text>
        </Flex>
        <Flex>
          <Flex gap="middle">
            <Flex vertical gap="middle" style={{ width: "40rem" }}>
              <UpcomingMeetings />
            </Flex>
            <Flex gap="middle" vertical style={{ flex: 1 }}>
              <ActivitySummary />
              <StudentTable />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Content>
  );
};
export default DashboardPage;

const stylesInline = {
  content: {
    padding: "2rem",
  },
};
