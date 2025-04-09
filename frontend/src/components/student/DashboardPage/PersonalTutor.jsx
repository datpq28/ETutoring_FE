import { MessageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { viewListTutorByStudent } from "../../../../api_service/admin_service";
import LoadingSection from "../../common/LoadingSection";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;
const userId = localStorage.getItem("userId");

export default function PersonalTutor() {
  let navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getTutor = async () => {
      const data = await viewListTutorByStudent(userId);
      if (data) {
        setTutor(data.tutor);
        setLoading(false);
      }
    };
    getTutor();
  }, []);

  return (
    <>
      {loading ? (
        <LoadingSection length={1} />
      ) : (
        <Card
          title={
            <Flex vertical gap="small">
              <Title level={3} style={{ margin: 0, color: "white" }}>
                My Personal Tutor
              </Title>
              <Text style={{ margin: 0, color: "#cdd9fb" }}>
                Your academic guide and mentor
              </Text>
            </Flex>
          }
          classNames={{
            header: "my-card",
          }}
          styles={{
            header: {
              color: "white",
              width: "100%",
              background: "#1677ff",
              paddingTop: "1.6rem",
              paddingBottom: "1.6rem",
            },
          }}
        >
          <Flex vertical gap="large">
            <Flex gap="large">
              <Avatar
                size={100}
                src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${
                  tutor?._id || 1
                }`}
              />
              <Flex vertical gap="small">
                <Title level={4} style={{ margin: 0 }}>
                  {tutor?.firstname || ""} {tutor?.lastname || ""}
                </Title>
                <Text style={{ margin: 0 }}>{tutor?.email || ""}</Text>
              </Flex>
            </Flex>
            <Flex justify="space-between">
              {/* <Button
                type="primary"
                color="default"
                variant="outlined"
                icon={<VideoCameraOutlined />}
              >
                Book meeting
              </Button> */}
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => navigate("/student/messages")}
              >
                Message
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
}
