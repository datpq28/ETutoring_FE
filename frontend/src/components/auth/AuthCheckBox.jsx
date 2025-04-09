export default function AuthCheckBox({
  children,
  textStyle = {},
  name,
  checked,
  onChange,
}) {
  return (
    <>
      <label style={styles.label}>
        <input
          type="checkbox"
          style={styles.checkBox}
          checked={checked}
          name={name}
          onChange={onChange}
        />
        <span style={textStyle}>{children}</span>
      </label>
    </>
  );
}

const styles = {
  label: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    display: "none",
  },
  checkBox: {
    width: "2.6rem",
    height: "2.6rem",
    borderRadius: "5px",
    border: "2px solid #000",
    display: "flex",
    justifyContent: "center",
    alignItem: "center",
  },
};
