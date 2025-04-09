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
  List,
  message,
  notification,
  Space,
  Tooltip,
  Typography,
  Input,
  Popconfirm,
} from "antd";
import {
  createComment,
  deleteComment,
  editComment,
  getComments,
} from "../../../api_service/comment_service";
import { useCallback, useEffect, useState } from "react";
import { formatTime } from "../../utils/Date";
const userId = localStorage.getItem("userId");

export default function CommentBox({ onOpenModalComment, blogId }) {
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [editCommentContent, setEditCommentContent] = useState("");
  const [commentIsEditing, setCommentIsEditing] = useState(null);
  const [commentForm] = Form.useForm();
  const [editForm] = Form.useForm();
  // Fetch comments function
  const fetchComments = useCallback(async () => {
    try {
      const commentsData = await getComments(blogId);
      // Sắp xếp các bình luận theo createdAt (tăng dần)
      const sortedComments = commentsData.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setComments(sortedComments);
    } catch (error) {
      message.error("Failed to load comments");
      console.error("Error fetching comments:", error);
    }
  }, [blogId]);
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const onCommentFinish = async () => {
    if (!commentContent.trim()) return;
    console.log("commentContent", commentContent);
    try {
      await createComment(blogId, { content: commentContent });
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
      await editComment(commentIsEditing, editCommentContent);
      setEditCommentContent("");
      handleCloseEditComment();
      await fetchComments();
    } catch (error) {
      message.error("Failed to submit comment");
      console.error("Error submitting comment:", error);
    }
  };

  // Xử lý sự kiện khi nhấn Enter
  const handleKeyPress = (e, form) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn xuống dòng
      form.submit(); // Gửi form
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
      await deleteComment(commentId);
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

  return (
    <Card
      title="Comments Box"
      extra={
        <Button type="text" onClick={onOpenModalComment}>
          <Tooltip title="Close">
            <CloseOutlined />
          </Tooltip>
        </Button>
      }
    >
      <Flex vertical gap="middle">
        <div style={{ maxHeight: "30rem", overflowY: "auto" }}>
          {comments.length === 0 ? (
            <Empty description="No comments yet. Be the first to comment!" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={comments}
              renderItem={(item) => (
                <List.Item
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
                                handleOpenEditComment(item?.content, item?._id)
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
                              onConfirm={() => handleDeleteComment(item?._id)}
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
                    //item.content
                    description={
                      commentIsEditing === item?._id &&
                      item?.authorId._id === userId ? (
                        <Form form={editForm} onFinish={onEditCommentFinish}>
                          <Flex gap="small" align="center">
                            <Input.TextArea
                              rows={1}
                              placeholder="Edit Comment"
                              value={editCommentContent}
                              onChange={(e) =>
                                setEditCommentContent(e.target.value)
                              }
                              onKeyDown={(e) => handleKeyPress(e, editForm)}
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
              )}
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
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} />
          </Flex>
        </Form>
      </Flex>
    </Card>
  );
}
