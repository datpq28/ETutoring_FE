import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  notification,
  Select,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import {
  createDocument,
  editDocument,
} from "../../../api_service/document_service.js";

const userId = localStorage.getItem("userId");

const selectSubject = [
  {
    value: "Math",
    label: "Math",
  },
  {
    value: "Literature",
    label: "Literature",
  },
  {
    value: "Biology",
    label: "Biology",
  },
  {
    value: "History",
    label: "History",
  },
  {
    value: "Geology",
    label: "Geology",
  },
];
const fileTypes = [
  ".pdf", // PDF file
  ".doc", // Word .doc
  ".docx", // Word .docx
  ".ppt", // PowerPoint .ppt
  ".pptx", // PowerPoint .pptx
];
export default function AddDocumentModal({
  open,
  onCancel,
  fetchDocuments,
  fileUpdate = null,
}) {
  const [file, setFile] = useState(null);
  const [form] = Form.useForm();
  useEffect(() => {
    if (fileUpdate) {
      form.setFieldsValue({
        title: fileUpdate.title,
        description: fileUpdate.description,
        subject: fileUpdate.subject,
      });
    }
  }, [fileUpdate, form]);

  const handleRemove = () => {
    setFile(null);
  };

  const handleBeforeUploadFile = (file) => {
    // Kiểm tra loại file
    const isValidType = fileTypes.some((ext) => file.name.endsWith(ext));
    if (!isValidType) {
      message.error("Only PDF, Word, and PowerPoint files are allowed!");
      return isValidType;
    }

    // Kiểm tra kích thước file (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error("File size must be less than 5MB!");
      return false;
    }

    // Nếu hợp lệ, lưu file vào state
    setFile(file);
    return false; // Trả về false để không thực hiện upload tự động (nếu cần)
  };

  // Xử lý khi submit form
  const handleSubmit = async () => {
    if (!file && !fileUpdate) {
      message.error("Please choose one file to upload!");
      return;
    }
    const values = await form.validateFields();
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("subject", values.subject);
    formData.append("uploadedBy", userId);
    if (file) {
      formData.append("file", file);
    }

    try {
      if (fileUpdate) {
        await editDocument(fileUpdate._id, formData);
      } else {
        await createDocument(formData);
      }
      onCancel();
      form.resetFields();
      setFile(null);
      notification.success({
        message: `${fileUpdate ? "Edit" : "Upload"} Success`,
        duration: 3,
      });
      await fetchDocuments();
    } catch (error) {
      message.error("Error when uploading file");
      console.error(error);
    }
  };

  return (
    <Modal
      title={fileUpdate ? "Update Document" : "Upload Document"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter title" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description Document"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: "Please input!" }]}
        >
          <Select placement="bottomLeft" options={selectSubject} />
        </Form.Item>
        <Form.Item label="Select File">
          <Upload
            beforeUpload={handleBeforeUploadFile}
            fileList={file ? [file] : []} // Chỉ có 1 file duy nhất
            maxCount={1}
            onRemove={handleRemove}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
