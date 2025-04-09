import {
  FileOutlined,
  FolderOpenOutlined,
  MessageOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Avatar, Card, Col, Flex, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { getConversations } from "../../../../api_service/mesages_service";
import { getBlogs } from "../../../../api_service/blog_service";
import { getDocuments } from "../../../../api_service/document_service";
import { fetchMeetingsByTutor } from "../../../../api_service/meeting_service";

const { Title, Text } = Typography;
const userId = localStorage.getItem("userId");
const role = localStorage.getItem("role");
export default function ActivitySummary() {
  const [conversations, setConversations] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const conversations = await getConversations(userId, role);
      setConversations(conversations);
    };
    const fetchBlogs = async () => {
      const blogs = await getBlogs();
      const filteredBlogs = blogs.filter(
        (blog) => blog.uploaderId._id === userId
      );
      setBlogs(filteredBlogs);
    };
    const fetchDocuments = async () => {
      const documents = await getDocuments();
      console.log("documents", documents);
      const filteredDocuments = documents.filter(
        (document) => document.uploaderId._id === userId
      );
      setDocuments(filteredDocuments);
    };

    const getMeetings = async () => {
      const data = await fetchMeetingsByTutor(userId);
      if (data) {
        setMeetings(data);
      }
    };

    fetchConversations();
    fetchBlogs();
    fetchDocuments();
    getMeetings();
  }, []);
  return (
    <Card
      title={
        <Flex vertical gap="small">
          <Title level={3} style={{ margin: 0 }}>
            Activity Summary
          </Title>
          <Text style={{ margin: 0, color: "#7b889c" }}>
            Your activity all the time
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
          paddingTop: "1.6rem",
          paddingBottom: "1.6rem",
        },
      }}
    >
      <Row gutter={[16, 16]} wrap>
        <Col span={6}>
          <ActivityItem
            avatar={
              <Avatar
                style={{ backgroundColor: "#fdebd0" }}
                size={42}
                icon={<MessageOutlined style={{ color: "#e67e22" }} />}
              />
            }
            title="Messages"
            value={conversations?.length || 1}
          />
        </Col>
        <Col span={6}>
          <ActivityItem
            avatar={
              <Avatar
                style={{ backgroundColor: "#f3e8ff" }}
                size={42}
                icon={<VideoCameraOutlined style={{ color: "#993eeb" }} />}
              />
            }
            title="Meetings"
            value={meetings?.length || 1}
          />
        </Col>
        <Col span={6}>
          <ActivityItem
            avatar={
              <Avatar
                style={{ backgroundColor: "#dcfce7" }}
                size={42}
                icon={<FolderOpenOutlined style={{ color: "#22a854" }} />}
              />
            }
            title="Documents"
            value={documents?.length}
          />
        </Col>
        <Col span={6}>
          <ActivityItem
            avatar={
              <Avatar
                style={{ backgroundColor: "#dbeafe" }}
                size={42}
                icon={<FileOutlined style={{ color: "#1677ff" }} />}
              />
            }
            title="Blogs"
            value={blogs?.length || 1}
          />
        </Col>
      </Row>
    </Card>
  );
}

function ActivityItem({ avatar, title, value }) {
  return (
    <Card style={{ minWidth: "20rem" }}>
      <Flex gap="middle" align="center">
        {avatar}
        <Flex vertical>
          <Title level={5} style={{ margin: 0, color: "#7b889c" }}>
            {title}
          </Title>
          <Title level={2} style={{ margin: 0 }}>
            {value}
          </Title>
        </Flex>
      </Flex>
    </Card>
  );
}
