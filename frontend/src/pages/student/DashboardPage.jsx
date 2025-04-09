import { Flex, Layout, Typography } from "antd";
const { Content } = Layout;
import PersonalTutor from "../../components/student/DashboardPage/PersonalTutor";
import UpcomingMeetings from "../../components/student/DashboardPage/UpcomingMeetings";
import ActivitySummary from "../../components/student/DashboardPage/ActivitySummary";
import Resources from "../../components/student/DashboardPage/Resources";
const { Title, Text } = Typography;
export default function DashboardPage() {
  return (
    <Content style={stylesInline.content}>
      <Flex vertical gap="middle">
        <Flex vertical gap="middle">
          <Title level={2} style={{ margin: 0 }}>
            Student Dashboard
          </Title>
          <Text type="secondary" style={{ margin: 0 }}>
            Welcome back! Here&apos;s an overview of your tutoring activities.
          </Text>
        </Flex>
        <Flex gap="middle">
          <Flex vertical gap="middle" style={{ width: "40rem" }}>
            <PersonalTutor />
            <UpcomingMeetings />
          </Flex>
          <Flex gap="middle" vertical style={{ flex: 1 }}>
            <ActivitySummary />
            <Resources />
          </Flex>
        </Flex>
      </Flex>
    </Content>
  );
}

const stylesInline = {
  content: {
    padding: "2rem",
  },
};
