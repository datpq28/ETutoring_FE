import { Flex, Layout } from "antd";
import DocumentActionsBar from "../../components/DocumentsPage/DocumentActionsBar.jsx";
import DocumentList from "../../components/DocumentsPage/DocumentList.jsx";
import { useCallback, useEffect, useState } from "react";
import { getDocuments } from "../../../api_service/document_service.js";
import LoadingSection from "../../components/common/LoadingSection.jsx";
const { Content } = Layout;
// const userId = localStorage.getItem("userId");
export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    const documents = await getDocuments();
    setDocuments(documents);
    setIsLoading(false);
  }, []);
  console.log("documents", documents);
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <Content style={stylesInline.content}>
      <Flex vertical gap="large">
        <DocumentActionsBar
          fetchDocuments={fetchDocuments}
          documents={documents}
          setDocuments={setDocuments}
        />
        {isLoading ? (
          <LoadingSection length={3} />
        ) : (
          <DocumentList documents={documents} fetchDocuments={fetchDocuments} />
        )}
      </Flex>
    </Content>
  );
}

const stylesInline = {
  content: {
    padding: "2rem",
  },
};
