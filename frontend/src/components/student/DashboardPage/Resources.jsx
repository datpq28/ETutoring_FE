import { FileOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../../../../api_service/document_service";
import { formatTime } from "../../../utils/Date";
const { Title, Text } = Typography;
import { useNavigate } from "react-router";
export default function Resources() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDocuments = async () => {
      const documents = await getDocuments();
      const recentDocuments = documents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sắp xếp giảm dần theo thời gian tạo
        .slice(0, 4); // Lấy 4 file đầu tiên
      setDocuments(recentDocuments);
    };
    fetchDocuments();
  }, []);

  return (
    <Card
      title={
        <Flex vertical gap="small">
          <Title level={3} style={{ margin: 0, color: "white" }}>
            Resources
          </Title>
          <Text level={5} style={{ margin: 0, color: "#cdd9fb" }}>
            Useful documents and forms
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
      extra={
        <Button
          variant="filled"
          icon={<FileOutlined />}
          onClick={() => navigate("/student/documents")}
        >
          View All
        </Button>
      }
    >
      <Flex vertical gap="middle">
        {documents.map((doc) => {
          return (
            <DocumentItem
              key={doc._id}
              title={doc.title}
              fileType={doc.typeFile}
              time={doc.createdAt}
            />
          );
        })}
      </Flex>
    </Card>
  );
}

function DocumentItem({ title, fileType, time }) {
  return (
    <Card>
      <Flex gap="middle" align="center" justify="space-between">
        <Flex gap="middle" align="center">
          <Avatar
            style={{ backgroundColor: "#dbeafe" }}
            size={40}
            icon={<FileOutlined style={{ color: "#1677ff" }} />}
          />
          <Flex vertical>
            <Typography.Title level={5} style={{ margin: 0, color: "#7b889c" }}>
              {title}
            </Typography.Title>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {getFileType(fileType)}
            </Typography.Title>
          </Flex>
        </Flex>
        <Typography.Text style={{ margin: 0 }}>
          Uploaded at {formatTime(time)}
        </Typography.Text>
      </Flex>
    </Card>
  );
}

const getFileType = (mimeType) => {
  const fileTypes = {
    "application/pdf": "PDF",
    "application/msword": "Word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word",
    "application/vnd.ms-powerpoint": "PowerPoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PowerPoint",
  };

  return fileTypes[mimeType] || "unknown"; // Nếu không khớp, trả về "unknown"
};
