import { Flex, Cascader } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";
import { Typography } from "antd";
const { Text } = Typography;
const options = [
  {
    value: "student",
    label: "Student",
  },
  {
    value: "tutor",
    label: "Tutor",
  },
];
export default function CascaderGroup({
  label,
  placeholder,
  onChange,
  style,
  cascaderStyle,
}) {
  return (
    <Flex vertical flex={1} style={style}>
      <Text style={styles.label}>{label}</Text>
      <Cascader
        style={{ ...styles.cascader, ...cascaderStyle }}
        options={options}
        allowClear={false}
        displayRender={(labels) => (
          <span style={styles.displayRender}>{labels.join(" / ")}</span>
        )}
        optionRender={(option) => (
          <span style={styles.displayRender}>{option.label}</span>
        )}
        suffixIcon={<CaretDownOutlined style={styles.cascaderIcon} />}
        variant="borderless"
        placeholder={<span style={styles.placeholder}>{placeholder}</span>}
        placement="bottomRight"
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
  cascader: {
    width: "100%",
    height: "7.1rem",
    borderRadius: "10px",
    background: "#FFF",
    border: "2px solid #000",
    outline: "none",
    boxShadow: "none",
  },
  displayRender: {
    color: "#000",
    fontFamily: "Poppins",
    fontSize: "2rem",
    fontWeight: 400,
    lineHeight: "normal",
  },
  placeholder: {
    color: "#bfbfbf",
    fontFamily: "Poppins",
    fontSize: "2rem",
    fontWeight: 300,
    lineHeight: "normal",
  },
  cascaderIcon: {
    fontSize: "3rem",
    color: "#555555",
    transform: "translateX(-2rem)",
  },
};
