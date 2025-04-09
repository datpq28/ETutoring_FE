import { useState, useEffect } from "react";
import { Layout, Calendar, Badge, Card, Modal, List, Button, Form, Input, Select, DatePicker, TimePicker, message, Popconfirm } from "antd";
import dayjs from "dayjs";
import { fetchAllMeetings, fetchTutors, fetchStudentsByTutor, createMeeting, editMeeting, deleteMeeting } from "../../../api_service/meeting_service";

const { Content } = Layout;
const { Option } = Select;

export default function AdminCalendarPage() {
  const [meetings, setMeetings] = useState([]);
  const [selectedDateMeetings, setSelectedDateMeetings] = useState([]);
  const [isMeetingListVisible, setIsMeetingListVisible] = useState(false);
  const [isCreateMeetingVisible, setIsCreateMeetingVisible] = useState(false);
  const [isEditMeetingVisible, setIsEditMeetingVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAllMeetings();
    loadTutors();
  }, []);

  const loadAllMeetings = async () => {
    const data = await fetchAllMeetings();
    setMeetings(data);
  };

  const loadTutors = async () => {
    const tutorList = await fetchTutors();
    setTutors(tutorList);
  };

  const handleTutorChange = async (tutorId) => {
    const studentsData = await fetchStudentsByTutor(tutorId);
    setStudents(studentsData);
  };

  const handleCreateMeeting = async (values) => {
    const { name, type, description, tutorId, dayOfWeek, startTime, endTime } = values;

    const formattedData = {
      name,
      description,
      tutorId,
      dayOfWeek: dayOfWeek.format("YYYY-MM-DD"), 
      startTime: `${dayOfWeek.format("YYYY-MM-DD")}T${startTime.format("HH:mm")}:00`, 
      endTime: `${dayOfWeek.format("YYYY-MM-DD")}T${endTime.format("HH:mm")}:00`, 
    };

    const response = await createMeeting(formattedData);
    if (response.error) {
        message.error(response.error);
    } else {
        message.success("Meeting created successfully!");
        form.resetFields();
        setIsCreateMeetingVisible(false);
        loadAllMeetings();
    }
};

  
  const handleEditMeeting = async (values) => {
    const { name, type, description, tutorId, dayOfWeek, startTime, endTime } = values;

  
    const updatedMeeting = {
      name,
      description,
      tutorId,
      dayOfWeek: dayOfWeek.format("YYYY-MM-DD"), 
      startTime: `${dayOfWeek.format("YYYY-MM-DD")}T${startTime.format("HH:mm")}:00`,
      endTime: `${dayOfWeek.format("YYYY-MM-DD")}T${endTime.format("HH:mm")}:00`,
    };
  
    const response = await editMeeting(editingMeeting._id, updatedMeeting);
    if (response.error) {
      message.error(response.error);
    } else {
      message.success("Meeting update successfully!");
      setIsEditMeetingVisible(false);
      loadAllMeetings();
    }
  };
  

  const handleDeleteMeeting = async (meetingId) => {
    const response = await deleteMeeting(meetingId);
    if (response.error) {
      message.error(response.error);
    } else {
      message.success("Meeting deleted successfully!");
      const updatedMeetings = selectedDateMeetings.filter(meeting => meeting._id !== meetingId);
      setSelectedDateMeetings(updatedMeetings);

      if (updatedMeetings.length === 0) {
        setIsMeetingListVisible(false);
      }
      loadAllMeetings();
    }
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    form.setFieldsValue({
      name: meeting.name,
      description: meeting.description,
      tutorId: meeting.tutorId,
      dayOfWeek: dayjs(meeting.dayOfWeek),
      startTime: dayjs(meeting.startTime),
      endTime: dayjs(meeting.endTime),
    });
    setIsEditMeetingVisible(true);
  };

  const dateCellRender = (value) => {
    const formattedDate = value.format("YYYY-MM-DD");
    const meetingsOnThisDay = meetings.filter(
      (meeting) => dayjs(meeting.startTime).format("YYYY-MM-DD") === formattedDate
    );

    return (
      <ul
        style={{ listStyle: "none", padding: 0, cursor: meetingsOnThisDay.length > 0 ? "pointer" : "default" }}
        onClick={() => {
          if (meetingsOnThisDay.length > 0) {
            setSelectedDateMeetings(meetingsOnThisDay);
            setIsMeetingListVisible(true);
          }
        }}
      >
        {meetingsOnThisDay.map((meeting) => (
          <li key={meeting._id}>
            <Badge
              status="processing"
              text={`${meeting.name} (${dayjs(meeting.startTime).format("HH:mm")} - ${dayjs(meeting.endTime).format("HH:mm")})`}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Content style={{ padding: "2rem" }}>
      <Card>
        <Button type="primary" onClick={() => setIsCreateMeetingVisible(true)} style={{ marginBottom: "1rem" }}>
          Create a new meeting
        </Button>
        <Calendar dateCellRender={dateCellRender} />
      </Card>

      {/* Meeting list modal */}
      <Modal
        title="Meeting List"
        open={isMeetingListVisible}
        onCancel={() => setIsMeetingListVisible(false)}
        footer={null}
      >
        <List
          itemLayout="vertical"
          dataSource={selectedDateMeetings}
          renderItem={(meeting) => (
            <List.Item key={meeting._id} actions={[
              <Button type="link" onClick={() => openEditModal(meeting)}>Edit</Button>,
              <Popconfirm title="Are you sure you want to delete?" onConfirm={() => handleDeleteMeeting(meeting._id)} okText="Delete" cancelText="Cancel">
                <Button type="link" danger>Delete</Button>
              </Popconfirm>
            ]}>
              <h3>{meeting.name}</h3>
              <p><strong>Time:</strong> {dayjs(meeting.startTime).format("HH:mm")} - {dayjs(meeting.endTime).format("HH:mm")}</p>
              <p><strong>Description:</strong> {meeting.description || "No description"}</p>
              
            </List.Item>
          )}
        />
      </Modal>

       {/* Meeting creation modal */}
       <Modal
        title="Create new meeting"
        open={isCreateMeetingVisible}
        onCancel={() => {
          form.resetFields(); // Reset all form fields to empty values
          setIsCreateMeetingVisible(false); // Close the modal
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateMeeting} layout="vertical">
          <Form.Item name="name" label="Meeting Name" rules={[{ required: true, message: "Please enter meeting name!" }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="tutorId" label="Tutor" rules={[{ required: true }]}>
            <Select onChange={handleTutorChange}>
              {tutors.map(tutor => (
                <Option key={tutor._id} value={tutor._id}>{tutor.firstname} {tutor.lastname}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dayOfWeek" label="Day of week" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item name="startTime" label="StartTime" rules={[{ required: true }]}>
  <TimePicker format="HH:mm" />
</Form.Item>

<Form.Item name="endTime" label="EndTime" rules={[{ required: true }]}>
  <TimePicker format="HH:mm" />
</Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Create</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Meeting edit modal */}
      <Modal
        title="Edit Meeting"
        open={isEditMeetingVisible}
        onCancel={() => setIsEditMeetingVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleEditMeeting} layout="vertical">
          <Form.Item name="name" label="Meeting name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dayOfWeek" label="Day of week" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="startTime" label="StartTime" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item name="endTime" label="EndTime" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}
