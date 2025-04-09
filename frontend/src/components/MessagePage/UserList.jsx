import {
  DeleteOutlined,
  EllipsisOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Empty,
  Flex,
  FloatButton,
  Input,
  Modal,
  Popover,
  Space,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import LoadingSection from "../common/LoadingSection";
import { removeConversations } from "../../../api_service/mesages_service";
const userId = localStorage.getItem("userId");
export default function UserList({
  conversationsByUser,
  onSelectConversation,
  onOpenUserModal,
  isLoading,
  fetchConversations,
}) {
  const [cardWidth, setCardWidth] = useState("50rem");
  const [searchValue, setSearchValue] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 875) {
        setCardWidth("20rem"); // Khi màn nhỏ thì card thu nhỏ
      } else if (window.innerWidth < 1300) {
        setCardWidth("30rem"); // Khi màn trung bình thì card thu nhỏ
      } else {
        setCardWidth("50rem"); // Khi màn lớn thì giữ nguyên 50rem
      }
    };
    updateWidth(); // Gọi ngay khi component mount
    window.addEventListener("resize", updateWidth); // Lắng nghe sự kiện resize

    return () => window.removeEventListener("resize", updateWidth); // Cleanup khi unmount
  }, []);

  conversationsByUser.filter((item) => {
    return item.participants.some((participant) =>
      participant.fullName.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  const handleSelectUser = async (id, index) => {
    onSelectConversation(id);
    setActiveUser(index);
    await fetchConversations();
  };

  const handleHoverUserCard = (id) => {
    setHoveredCardId(id);
  };

  const handleSearchValue = (e) => {
    setSearchValue(e.target.value);
  };
  const handleOpenOptionsCard = (e) => {
    e.stopPropagation();
  };

  const showDeleteConfirm = (conversationsIdByUser, participant) => {
    //Xóa người còn lại trong cuộc trò chuyện là mình
    const participantId = participant.participantId;
    const participantModel = participant.participantModel;
    Modal.confirm({
      title: "Are you sure delete this conversation?",
      icon: <ExclamationCircleFilled />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await removeConversations(
            conversationsIdByUser,
            participantId,
            participantModel
          );
          notification.success({
            message: "Conversation deleted",
            duration: 3,
          });
        } catch (error) {
          console.error("Error deleting conversation:", error);
          notification.error({
            message: "Failed to delete conversation",
            description: error.message,
            duration: 3,
          });
        }
      },
      afterClose: async () => {
        await fetchConversations();
      },
    });
  };

  return (
    <Card style={{ width: cardWidth, transition: "width 0.3s ease" }}>
      <Input.Search
        placeholder="Search..."
        onChange={handleSearchValue}
        style={{ marginBottom: "1rem" }}
        value={searchValue}
      />
      <div
        style={{
          height: "calc(100vh - 20rem)",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Flex gap="small" vertical>
          {!(conversationsByUser.length === 0) ? (
            conversationsByUser.map((item, index) => {
              const otherParticipant = item.participants.find(
                (participant) => participant.participantId !== userId
              );
              const user = item.participants.find(
                (participant) => participant.participantId === userId
              );
              const lastMessage = item.lastMessage || "No messages yet";
              const conversationsIdByUser = item._id;
              return (
                <Card
                  key={item._id || index}
                  style={{
                    cursor: "pointer",
                    border: "none",
                    marginLeft: "0.5rem",
                    marginRight: "0.5rem",
                    background: activeUser === index ? "#F5F5F5" : "#fff",
                    marginBottom: "0.5rem",
                  }}
                  onMouseEnter={() => handleHoverUserCard(item._id)}
                  onMouseLeave={() => handleHoverUserCard(null)}
                  size="small"
                  hoverable
                  onClick={() => handleSelectUser(item._id, index)}
                >
                  {hoveredCardId === item._id &&
                    user?.participantModel === "tutor" && (
                      <Popover
                        placement="bottom"
                        content={
                          <Flex vertical gap="small">
                            <Button
                              color="default"
                              variant="text"
                              onClick={() =>
                                showDeleteConfirm(conversationsIdByUser, user)
                              }
                            >
                              <Space align="center" size="small">
                                <Avatar
                                  size="small"
                                  style={{ backgroundColor: "#ccc" }}
                                  icon={<DeleteOutlined />}
                                />
                                Delete Conversation
                              </Space>
                            </Button>
                          </Flex>
                        }
                        trigger="click"
                      >
                        <Button
                          variant="filled"
                          shape="circle"
                          color="default"
                          style={{
                            position: "absolute",
                            top: "50%",
                            transform: "translateY(-50%)",
                            right: "2rem",
                          }}
                          onClick={handleOpenOptionsCard}
                        >
                          <EllipsisOutlined />
                        </Button>
                      </Popover>
                    )}
                  <Card.Meta
                    avatar={
                      <Avatar
                        src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${otherParticipant.participantId}`}
                      />
                    }
                    title={<a href="#">{otherParticipant.fullName}</a>}
                    description={lastMessage}
                  />
                </Card>
              );
            })
          ) : isLoading ? (
            <LoadingSection length={4}></LoadingSection>
          ) : (
            <>
              <Empty description="Please tap the button below to start a new conversation." />
            </>
          )}
        </Flex>
      </div>
      {/* Nút mở modal để chọn người trò chuyện */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ position: "absolute", right: 24, bottom: 24 }}
        onClick={onOpenUserModal}
      />
    </Card>
  );
}
