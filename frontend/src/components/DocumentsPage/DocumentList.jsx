import { useState } from "react";
import {
  Button,
  Card,
  Space,
  Table,
  Modal,
  message,
  notification,
  Tag,
} from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  deleteDocument,
  downloadDocument,
} from "../../../api_service/document_service.js";
import AddDocumentModal from "./AddDocumentModal.jsx";
import DetailDocumentModal from "./DetailDocumentModal.jsx";

const role = localStorage.getItem("role");
const userId = localStorage.getItem("userId");
export default function DocumentList({
  documents,
  fetchDocuments,
  admin = false,
}) {
  const [isAddDocumentModalVisible, setIsAddDocumentModalVisible] =
    useState(false);
  const [isDetailDocumentModalVisible, setIsDetailDocumentModalVisible] =
    useState(false);
  const [detailDocument, setDetailDocument] = useState(null);

  const [fileUpdate, setFileUpdate] = useState(null);

  const handleDeleteDocument = (id) => {
    Modal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this document?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDocument(id);
          notification.success({
            message: "Document Deleted",
            description: "The document has been successfully deleted.",
            duration: 3,
          });
          fetchDocuments();
        } catch (error) {
          console.error("Error deleting document:", error);
          message.error("An error occurred while deleting the document.");
        }
      },
    });
  };

  const handlerDownloadDocument = async (id, title) => {
    await downloadDocument(id, title);
  };

  const handleOpenAddDocumentModal = (file) => {
    setIsAddDocumentModalVisible(true);
    setFileUpdate(file);
  };

  const handleCloseAddDocumentModal = () => {
    setIsAddDocumentModalVisible(false);
  };

  const handleOpenDetailDocumentModal = (document) => {
    setIsDetailDocumentModalVisible(true);
    setDetailDocument(document);
  };

  const handleCloseDetailDocumentModal = () => {
    setIsDetailDocumentModalVisible(false);
  };

  const columns = [
    { title: "#", key: "index", render: (_, __, index) => index + 1 },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Subject", dataIndex: "subject", key: "subject" },

    {
      title: "Type",
      dataIndex: "typeFile",
      key: "typeFile",
      render: (type) => {
        let fileType = "";
        let color = "";

        switch (type) {
          case "application/pdf":
            fileType = "PDF";
            color = "red"; // PDF màu đỏ
            break;
          case "application/msword":
            fileType = "Word (.doc)";
            color = "blue"; // Word màu xanh nước biển (hex code cho màu xanh dương)
            break;
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            fileType = "Word (.docx)";
            color = "blue"; // Word màu xanh nước biển (hex code cho màu xanh dương)
            break;
          case "application/vnd.ms-powerpoint":
            fileType = "PowerPoint (.ppt)";
            color = "orange"; // PowerPoint màu cam (hex code cho màu cam)
            break;
          case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            fileType = "PowerPoint (.pptx)";
            color = "orange"; // PowerPoint màu cam (hex code cho màu cam)
            break;
          default:
            fileType = type.toUpperCase(); // Nếu không phải các loại trên thì hiển thị như cũ
            color = "geekblue"; // Màu sắc mặc định
            break;
        }

        return <Tag color={color}>{fileType}</Tag>;
      },
    },

    {
      title: "Upload Date",
      dataIndex: "createdAt",
      key: "uploadDate",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Uploader",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      render: (uploadedBy) => {
        // Kiểm tra nếu uploadedBy có giá trị và có firstname, lastname
        if (uploadedBy && uploadedBy.firstname && uploadedBy.lastname) {
          return `${uploadedBy.firstname} ${uploadedBy.lastname}`; // Kết hợp firstname và lastname
        } else {
          return "Unknown"; // Nếu không có thông tin, hiển thị "Unknown"
        }
      },
    },
    {
      title: "Size",
      dataIndex: "sizeFile",
      key: "sizeFile",
      render: (size) => {
        const sizeInMB = size / (1024 * 1024); // Chuyển từ byte sang MB
        let color = "";

        if (sizeInMB < 2) {
          color = "green"; // Màu xanh cho file nhẹ
        } else if (sizeInMB >= 2 && sizeInMB <= 5) {
          color = "orange"; // Màu cam cho file trung bình
        } else {
          color = "red"; // Màu đỏ cho file lớn
        }

        return <Tag color={color}>{`${sizeInMB.toFixed(2)} MB`}</Tag>;
      },
      sorter: (a, b) => a.sizeFile - b.sizeFile, // Sắp xếp theo dung lượng file
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        console.log("record", record);
        console.log("role", role);
        return (
          <Space size="middle">
            <Button
              icon={<FileTextOutlined />}
              onClick={() => handleOpenDetailDocumentModal(record)}
            >
              Details
            </Button>
            {role === "tutor" && record?.uploadedBy?._id === userId && (
              <Button
                onClick={() => handleOpenAddDocumentModal(record)}
                color="orange"
                variant="outlined"
                icon={<EditOutlined />}
              >
                Edit
              </Button>
            )}

            {role === "tutor" && record?.uploadedBy?._id === userId && (
              <Button
                danger
                onClick={() => handleDeleteDocument(record._id)}
                icon={<DeleteOutlined />}
              >
                Xoá
              </Button>
            )}
            {admin && (
              <Button
                danger
                onClick={() => handleDeleteDocument(record._id)}
                icon={<DeleteOutlined />}
              >
                Xoá
              </Button>
            )}
            <Button
              type="primary"
              download
              onClick={() => handlerDownloadDocument(record._id, record.title)}
              icon={<DownloadOutlined />}
            >
              Download
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <Card title="Documents List">
      <Table dataSource={documents} columns={columns} rowKey="_id" />
      <AddDocumentModal
        fetchDocuments={fetchDocuments}
        open={isAddDocumentModalVisible}
        onCancel={handleCloseAddDocumentModal}
        fileUpdate={fileUpdate}
      />
      <DetailDocumentModal
        open={isDetailDocumentModalVisible}
        onCancel={handleCloseDetailDocumentModal}
        document={detailDocument}
      />
    </Card>
  );
}
