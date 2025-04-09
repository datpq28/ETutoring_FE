import {
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Flex, Input, Segmented, Select } from "antd";
import { useState, useEffect, useRef } from "react";
import AddDocumentModal from "./AddDocumentModal.jsx";

const role = localStorage.getItem("role");
const userId = localStorage.getItem("userId");

// Simplified file type options
const selectTypeFile = [
  {
    value: "empty",
    label: "Select Type File",
  },
  {
    value: "pdf",
    label: "PDF",
  },
  {
    value: "word",
    label: "Word",
  },
  {
    value: "powerpoint",
    label: "PowerPoint",
  },
];

// Updated mapping to handle multiple MIME types per category
const fileTypeMapping = {
  pdf: ["application/pdf"],
  word: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  powerpoint: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
};

const selectSubject = [
  {
    value: "empty",
    label: "Select Subject",
  },
  {
    value: "math",
    label: "Math",
  },
  {
    value: "literature",
    label: "Literature",
  },
  {
    value: "biology",
    label: "Biology",
  },
  {
    value: "history",
    label: "History",
  },
  {
    value: "geology",
    label: "Geology",
  },
];

const listOption = [
  {
    value: "all_documents",
    label: "All Documents",
    icon: <TeamOutlined />,
  },
  {
    value: "my_documents",
    label: "My Documents",
    icon: <UserOutlined />,
  },
];

export default function DocumentActionsBar({
  fetchDocuments,
  documents,
  setDocuments,
}) {
  const [originalDocuments, setOriginalDocuments] = useState([]);
  const [fileType, setFileType] = useState("empty");
  const [subject, setSubject] = useState("empty");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState("all_documents");
  const [isAddDocumentModalVisible, setIsAddDocumentModalVisible] =
    useState(false);
  const isInitialMount = useRef(true);
  const isFiltering = useRef(false);

  // Store original documents when they are first loaded
  useEffect(() => {
    if (documents && documents.length > 0 && originalDocuments.length === 0) {
      setOriginalDocuments([...documents]);
    }
  }, [documents]);

  // Apply filters when criteria change, but not during initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!isFiltering.current && originalDocuments.length > 0) {
      applyFilters();
    }
  }, [fileType, subject, searchText, viewMode]);

  const applyFilters = () => {
    isFiltering.current = true;

    // Start with all original documents
    let filteredDocs = [...originalDocuments];

    // Filter by file type (now handling arrays of MIME types)
    if (fileType !== "empty") {
      const mimeTypes = fileTypeMapping[fileType];
      filteredDocs = filteredDocs.filter((doc) =>
        mimeTypes.includes(doc.typeFile)
      );
    }

    // Filter by subject
    if (subject !== "empty") {
      filteredDocs = filteredDocs.filter((doc) => doc.subject === subject);
    }

    // Filter by search text (checking title and description)
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      filteredDocs = filteredDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(lowerCaseSearch) ||
          doc.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Filter by my documents (user ID)
    if (viewMode === "my_documents") {
      filteredDocs = filteredDocs.filter(
        (doc) => doc.uploadedBy?._id === userId
      );
    }

    // Update the documents state with filtered results
    setDocuments(filteredDocs);
    isFiltering.current = false;
  };

  const handleFileTypeChange = (value) => {
    setFileType(value);
  };

  const handleSubjectChange = (value) => {
    setSubject(value);
  };

  const handleViewModeChange = (value) => {
    setViewMode(value);
  };

  const handleOpenAddDocumentModal = () => {
    setIsAddDocumentModalVisible(true);
  };

  const handleCloseAddDocumentModal = () => {
    setIsAddDocumentModalVisible(false);
  };

  // Function to reset all filters
  const resetFilters = () => {
    setFileType("empty");
    setSubject("empty");
    setSearchText("");
    setViewMode("all_documents");
    setDocuments(originalDocuments);
  };

  return (
    <Card>
      <Flex gap="middle" justify="space-between" wrap>
        <Flex gap="middle" wrap>
          <Button
            type="primary"
            onClick={resetFilters}
            icon={<ReloadOutlined />}
          >
            Reset
          </Button>
          <Select
            defaultValue="empty"
            style={{
              width: 200,
            }}
            placement="bottomLeft"
            onChange={handleFileTypeChange}
            options={selectTypeFile}
            value={fileType}
          />
          <Select
            style={{
              width: 200,
            }}
            defaultValue="empty"
            placement="bottomLeft"
            options={selectSubject}
            onChange={handleSubjectChange}
            value={subject}
          />
        </Flex>
        <Flex gap="middle" wrap>
          <Input
            addonBefore={<SearchOutlined />}
            placeholder="Search File"
            style={{
              width: 200,
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {role === "tutor" && (
            <>
              <Button
                type="primary"
                onClick={handleOpenAddDocumentModal}
                icon={<UploadOutlined />}
              >
                Upload File
              </Button>
              <Segmented
                defaultValue="all_documents"
                options={listOption}
                onChange={handleViewModeChange}
                value={viewMode}
              />
            </>
          )}
        </Flex>
      </Flex>
      <AddDocumentModal
        open={isAddDocumentModalVisible}
        onCancel={handleCloseAddDocumentModal}
        fetchDocuments={fetchDocuments}
      />
    </Card>
  );
}
