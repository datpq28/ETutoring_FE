import { Flex, Image, notification, Typography } from "antd";
import { Link as LinkRouter } from "react-router";
import auth_02 from "../../assets/imgs/auth-02.png";
import styles from "../../assets/css/RegisterPage.module.css";
import AuthLabel from "../../components/auth/AuthLabel";
import AuthDescription from "../../components/auth/AuthDescription";
import TextInputGroup from "../../components/auth/TextInputGroup";
import PasswordInputGroup from "../../components/auth/PasswordInputGroup";
import AuthCheckBox from "../../components/auth/AuthCheckBox";
import AuthButton from "../../components/auth/AuthButton";
import CascaderGroup from "../../components/auth/CascaderGroup";
import { useReducer } from "react";
import AssistanceLink from "../../components/auth/AssistanceLink";
import { registerSendOTP } from "../../../api_service/auth_service";
import { useNavigate } from "react-router";

const { Text, Link } = Typography;

function formReducer(state, action) {
  switch (action.type) {
    case "CHANGE_INPUT_VALUE": {
      return {
        ...state,
        [action.field]: { value: action.value, error: "" },
      };
    }
    case "CHECKED_INPUT": {
      return {
        ...state,
        [action.field]: { checked: action.checked },
      };
    }
    case "SELECT_CASCADER": {
      return {
        ...state,
        [action.field]: { value: action.value, error: "" },
      };
    }
    default: {
      return state;
    }
  }
}

const initialValue = {
  "first-name": {
    value: "",
    error: "",
  },
  "last-name": {
    value: "",
    error: "",
  },
  email: {
    value: "",
    error: "",
  },
  phone: {
    value: "",
    error: "",
  },
  role: {
    value: "",
    error: "",
  },
  password: {
    value: "",
    error: "",
  },
  "confirm-password": {
    value: "",
    error: "",
  },
  "confirm-checked": {
    checked: false,
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [dataForm, dispatch] = useReducer(formReducer, initialValue);
  const {
    ["first-name"]: firstName,
    ["last-name"]: lastName,
    email,
    phone,
    role,
    password,
    ["confirm-password"]: confirmPassword,
    ["confirm-checked"]: confirmChecked,
  } = dataForm;
  console.log("fist name>>> ", firstName.value);
  console.log("last name >>> ", lastName.value);
  console.log("email >>> ", email.value);
  console.log("phone >>> ", phone.value);
  console.log("role >>> ", role.value);
  console.log("password >>> ", password.value);
  console.log("confirm password >>> ", confirmPassword.value);
  console.log("confirm checked >>> ", confirmChecked.checked);
  function handleChangeInputValue(e) {
    const action = {
      type: "CHANGE_INPUT_VALUE",
      field: e.target.name,
      value: e.target.value,
    };
    dispatch(action);
  }
  function handleConfirmChecked(e) {
    const action = {
      type: "CHECKED_INPUT",
      field: e.target.name,
      checked: e.target.checked,
    };
    dispatch(action);
  }
  function handleSelectCascader(value) {
    const action = {
      type: "SELECT_CASCADER",
      field: "role",
      value: value[0],
    };
    dispatch(action);
  }
  function validatePassword(password) {
    const isValidLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    return isValidLength && hasNumber;
  }
  
  async function handleRegister() {
    if (!validatePassword(password.value)) {
      alert("Password must be at least 8 characters long and contain at least 1 number.");
      return;
    }
  
    if (password.value !== confirmPassword.value) {
      alert("Passwords do not match.");
      return;
    }
  
    if (!confirmChecked.checked) {
      alert("Please agree to the terms and privacy policy.");
      return;
    }
  
    try {
      const response = await registerSendOTP(
        firstName.value,
        lastName.value,
        email.value,
        password.value,
        role.value,
        "",
        "",
        null
      );
      console.log("Register response:", response);
      notification.success({
        message: "OTP sent to your email!",
        duration: 3,
      });
      navigate("/auth/verify-otp", { state: { email: email.value } });
    } catch (error) {
      console.error("Error during registration:", error);
      notification.error({
        message: "Failed to register. Please try again.",
        duration: 3,
      });
    }
  }
  

  return (
    <Flex
      justify="space-between"
      align="center"
      className={styles.screenContainer}
    >
      <Image src={auth_02} width={550} alt="auth image" preview={false} />
      <Flex vertical={true} style={stylesInline.form}>
        <AuthLabel>Register</AuthLabel>
        <AuthDescription>
          Let’s get you all st up so you can access your personal account.
        </AuthDescription>
        <Flex style={{ marginTop: "1.1rem", gap: "4rem" }} align="center">
          <TextInputGroup
            label="First Name"
            name="first-name"
            placeholder="First Name"
            value={firstName.value}
            onChange={handleChangeInputValue}
          />
          <TextInputGroup
            label="Last Name"
            name="last-name"
            placeholder="Last Name"
            value={lastName.value}
            onChange={handleChangeInputValue}
          />
        </Flex>
        <Flex style={{ marginTop: "1.1rem", gap: "4rem" }} align="center">
          <TextInputGroup
            label="Email"
            name="email"
            placeholder="Email"
            value={email.value}
            onChange={handleChangeInputValue}
          />
          <TextInputGroup
            label="Phone"
            name="phone"
            placeholder="Phone"
            value={phone.value}
            onChange={handleChangeInputValue}
          />
        </Flex>
        <CascaderGroup
          label="Role"
          placeholder="Role"
          onChange={handleSelectCascader}
        />
        <PasswordInputGroup
          label="Password"
          name="password"
          placeholder="Password"
          value={password.value}
          onChange={handleChangeInputValue}
          style={stylesInline.passwordInput}
        />
        <PasswordInputGroup
          label="Confirm Password"
          name="confirm-password"
          placeholder="Confirm Password"
          value={confirmPassword.value}
          onChange={handleChangeInputValue}
          style={stylesInline.passwordInput}
        />
        <Flex style={{ marginTop: "1.6rem" }}>
          <AuthCheckBox
            name="confirm-checked"
            checked={confirmChecked.checked}
            onChange={handleConfirmChecked}
          >
            <Text style={stylesInline.textCheckBox}>
              I agree to all the{" "}
              <LinkRouter to="/" component={Link} style={stylesInline.linkText}>
                Terms{" "}
              </LinkRouter>
              and{" "}
              <LinkRouter to="/" component={Link} style={stylesInline.linkText}>
                Privacy Policies
              </LinkRouter>
            </Text>
          </AuthCheckBox>
        </Flex>
        <AuthButton style={stylesInline.button} onClick={handleRegister}>
          {" "}
          Register{" "}
        </AuthButton>
        <AssistanceLink
          text="Already have an account?"
          link="Login"
          path="/auth/login"
          style={stylesInline.link}
        />
      </Flex>
    </Flex>
  );
}

const stylesInline = {
  form: {
    width: "60.3rem",
  },
  passwordInput: {
    marginTop: "1.2rem",
  },
  textCheckBox: {
    color: "#000",
    fontFamily: "Poppins",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineHeight: "normal",
    textAlign: "center",
    marginLeft: ".7rem",
  },

  button: {
    marginTop: "2rem",
  },
  linkText: {
    color: "#D51D1D",
    fontFamily: "Poppins",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineHeight: "normal",
  },
  link: {
    textAlign: "center",
  },
};
