import { Avatar, List, Modal, notification, Typography } from "antd";
import LoadingSection from "../common/LoadingSection";
import { useEffect, useState } from "react";
import {
  createConversations,
  getAllUser,
} from "../../../api_service/mesages_service";
const userId = localStorage.getItem("userId");
const userModel = localStorage.getItem("role");
export default function ModalCreateConversation({
  isOpen,
  onCancel,
  conversationsByUser,
  fetchConversations,
}) {
  const [userListMap, setUserListMap] = useState();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAllUser();
        if (
          result &&
          typeof result === "object" &&
          "students" in result &&
          Array.isArray(result.students) &&
          "tutors" in result &&
          Array.isArray(result.tutors)
        ) {
          const filteredData = {
            students: result.students.filter(
              (student) => student._id !== userId
            ),
            tutors: result.tutors.filter((tutor) => tutor._id !== userId),
          };
          setUserListMap(filteredData);
        } else {
          console.error("Invalid data structure received from API:", result);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);
  const handleSetUser = (id, role) => {
    setUser((prevUser) => (prevUser?.id === id ? {} : { id, role }));
  };

  const handleCancel = () => {
    setUser(null);
    onCancel();
  };

  const handleCreateConversation = async (
    selectedUserId,
    selectedUserModel
  ) => {
    console.log("userListMap", userListMap);
    console.log("conversationsByUser", conversationsByUser);
    if (!selectedUserId) {
      notification.error({
        message: "Please select a person to continue.",
        duration: 3,
      });
      return;
    }
    // Kiểm tra xem đã có cuộc trò chuyện với selectedUserId chưa
    const conversationExists = conversationsByUser.some((conversation) =>
      conversation.participants.some(
        (participant) => participant.participantId === selectedUserId
      )
    );

    if (conversationExists) {
      notification.error({
        message: "This conversation already exists.",
        duration: 3,
      });
      return;
    }

    try {
      const participants = [
        { participantId: userId, participantModel: userModel },
        { participantId: selectedUserId, participantModel: selectedUserModel },
      ];

      await createConversations(participants);
      setUser(null);
      await fetchConversations();
      onCancel();
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <Modal
      title="Select User to Start Conversation"
      open={isOpen}
      onOk={() => handleCreateConversation(user?.id, user?.role)}
      onCancel={handleCancel}
    >
      {userListMap ? (
        <>
          <Typography.Title level={5}>Students</Typography.Title>
          <List
            dataSource={userListMap.students}
            renderItem={(student) => {
              return (
                <List.Item
                  onClick={() => {
                    handleSetUser(student._id, "student");
                    //   handleCreateConversation(student._id, "student");
                  }}
                  style={{
                    cursor: "pointer",
                    transition: "background 0.3s",
                    borderRadius: "1rem",
                    background:
                      String(user?.id) === String(student._id)
                        ? "#f0f0f0"
                        : "#fff",
                  }}
                  onMouseEnter={(e) => {
                    if (String(user?.id) !== String(student._id)) {
                      e.currentTarget.style.background = "#f0f0f0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (String(user?.id) !== String(student._id)) {
                      e.currentTarget.style.background = "#fff";
                    }
                  }}
                >
                  <Avatar
                    src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${student._id}`}
                    style={{ marginRight: "1rem" }}
                  />
                  {`${student.firstname} ${student.lastname}`}
                </List.Item>
              );
            }}
          />

          <Typography.Title level={5}>Tutors</Typography.Title>

          <List
            dataSource={userListMap.tutors}
            renderItem={(tutor) => (
              <List.Item
                onClick={() => handleSetUser(tutor._id, "tutor")}
                style={{
                  cursor: "pointer",
                  transition: "background 0.3s",
                  borderRadius: "1rem",
                  background:
                    String(user?.id) === String(tutor._id) ? "#f0f0f0" : "#fff",
                }}
                onMouseEnter={(e) => {
                  if (String(user?.id) !== String(tutor._id)) {
                    e.currentTarget.style.background = "#f0f0f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (String(user?.id) !== String(tutor._id)) {
                    e.currentTarget.style.background = "#fff";
                  }
                }}
              >
                <Avatar
                  src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${tutor._id}`}
                  style={{ marginRight: "10px" }}
                />
                {`${tutor.firstname} ${tutor.lastname}`}
              </List.Item>
            )}
          />
        </>
      ) : (
        <LoadingSection length={3} />
      )}
    </Modal>
  );
}
