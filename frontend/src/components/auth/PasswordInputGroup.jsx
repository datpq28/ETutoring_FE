import { Flex, Input } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
const { Text } = Typography;
export default function PasswordInputGroup({
  label,
  placeholder,
  name,
  value,
  onChange,
  style,
  inputStyle,
}) {
  return (
    <Flex vertical flex={1} style={style}>
      <Text style={styles.label}>{label}</Text>
      <Input.Password
        style={{
          ...styles.input,
          ...inputStyle,
        }}
        allowClear={{
          clearIcon: <CloseCircleOutlined style={styles.clearIcon} />,
        }}
        variant="borderless"
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={onChange}
      />
    </Flex>
  );
}

const styles = {
  label: {
    color: "#000",
    fontFamily: "Poppins",
    fontSize: "2rem",
    fontWeight: 400,
    lineHeight: "normal",
  },
  input: {
    height: "7.1rem",
    borderRadius: "10px",
    background: "#FFF",
    color: "#000",
    fontFamily: "Poppins",
    fontSize: "2rem",
    fontWeight: 400,
    lineHeight: "normal",
    paddingRight: "3.9rem",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#000",
    outline: "none",
    boxShadow: "none",
  },
  clearIcon: {
    fontSize: "2rem",
    color: "#555555",
  },
};
