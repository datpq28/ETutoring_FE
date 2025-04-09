import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  List,
  message,
  Modal,
  notification,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  createCommentDocument,
  deleteCommentDocument,
  editCommentDocument,
  getCommentsByDocument,
} from "../../../api_service/commentdocument_service";
import { formatTime } from "../../utils/Date";
import LoadingSection from "../common/LoadingSection";
const userId = localStorage.getItem("userId");

export default function DetailDocumentModal({ open, onCancel, document }) {
  const [commentContent, setCommentContent] = useState("");
  const [editCommentContent, setEditCommentContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentIsEditing, setCommentIsEditing] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    const comments = await getCommentsByDocument(document?._id);
    // Sắp xếp các bình luận theo createdAt (tăng dần)
    const sortedComments = comments.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    setComments(sortedComments);
    setIsLoading(false);
  }, [document]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [fetchComments, open]);

  console.log("comments", comments);

  const onCommentFinish = async () => {
    if (!commentContent.trim()) return;
    console.log("commentContent", commentContent);
    try {
      await createCommentDocument(document?._id, commentContent.trim());
      setCommentContent("");
      await fetchComments();
    } catch (error) {
      message.error("Failed to submit comment");
      console.error("Error submitting comment:", error);
    }
  };

  const onEditCommentFinish = async () => {
    if (!editCommentContent.trim()) return;
    try {
      await editCommentDocument(commentIsEditing, editCommentContent.trim());
      setEditCommentContent("");
      handleCloseEditComment();
      await fetchComments();
    } catch (error) {
      message.error("Failed to submit comment");
      console.error("Error submitting comment:", error);
    }
  };
  const handleOpenEditComment = (content, commentId) => {
    setEditCommentContent(content);
    setCommentIsEditing(commentId);
  };
  const handleCloseEditComment = () => {
    setCommentIsEditing(null);
  };
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentDocument(commentId);
      notification.success({
        message: "Delete Comment Success",
        duration: 3,
      });
      fetchComments();
    } catch (error) {
      notification.success({
        message: "Failed to delete comment",
        duration: 3,
      });
      console.error("Error deleting comment:", error);
    }
  };

  // Xử lý sự kiện khi nhấn Enter
  const handleKeyPress = (e, form) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng
      form.submit(); // Gửi form
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      title="Detail Document"
      width={1200}
    >
      <Typography.Title level={5}>Description</Typography.Title>
      <p>{document?.description}</p>
      {isLoading ? (
        <LoadingSection length={3} />
      ) : (
        <Card>
          <Flex vertical gap="middle">
            <div style={{ maxHeight: "30rem", overflowY: "auto" }}>
              {comments.length === 0 ? (
                <Empty description="No comments yet. Be the first to comment!" />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={comments || []}
                  renderItem={(item, index) => {
                    return (
                      <List.Item
                        key={index}
                        actions={
                          item?.authorId?._id === userId
                            ? commentIsEditing === item?._id
                              ? null
                              : [
                                  <Button
                                    key="edit"
                                    color="default"
                                    variant="filled"
                                    icon={<EditOutlined />}
                                    onClick={() =>
                                      handleOpenEditComment(
                                        item?.content,
                                        item?._id
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>,
                                  <Popconfirm
                                    key="delete"
                                    title="Delete the Comment"
                                    description="Are you sure to delete this Comment?"
                                    okText="Yes"
                                    cancelText="No"
                                    placement="topRight"
                                    onConfirm={() =>
                                      handleDeleteComment(item?._id)
                                    }
                                  >
                                    <Button
                                      color="danger"
                                      variant="filled"
                                      icon={<DeleteOutlined />}
                                    >
                                      Delete
                                    </Button>
                                  </Popconfirm>,
                                ]
                            : null
                        }
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item?.authorId?._id}`}
                            />
                          }
                          title={
                            <Space size="small" align="center">
                              <Typography.Text strong>
                                {`${item?.authorId?.firstname} ${item?.authorId?.lastname}`}
                              </Typography.Text>
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: "1.2rem" }}
                              >
                                at {formatTime(item?.createdAt)}
                              </Typography.Text>
                            </Space>
                          }
                          description={
                            commentIsEditing === item?._id &&
                            item?.authorId._id === userId ? (
                              <Form
                                form={editForm}
                                onFinish={onEditCommentFinish}
                              >
                                <Flex
                                  gap="small"
                                  align="center"
                                  style={{ marginRight: "1rem" }}
                                >
                                  <Input.TextArea
                                    rows={1}
                                    placeholder="Edit Comment"
                                    value={editCommentContent}
                                    onChange={(e) =>
                                      setEditCommentContent(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      handleKeyPress(e, editForm)
                                    }
                                    autoSize={{ minRows: 1, maxRows: 6 }}
                                  />
                                  <Button
                                    color="danger"
                                    variant="filled"
                                    icon={<CloseOutlined />}
                                    onClick={handleCloseEditComment}
                                  >
                                    Cancel
                                  </Button>

                                  <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<EditOutlined />}
                                  >
                                    Edit
                                  </Button>
                                </Flex>
                              </Form>
                            ) : (
                              item?.content
                            )
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </div>
            <Form form={commentForm} onFinish={onCommentFinish}>
              <Flex gap="small" align="center">
                <Input.TextArea
                  rows={1}
                  placeholder="Comment"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, commentForm)}
                  autoSize={{ minRows: 1, maxRows: 6 }}
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                />
              </Flex>
            </Form>
          </Flex>
        </Card>
      )}
    </Modal>
  );
}
