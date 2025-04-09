import { Flex, Image, notification } from "antd";
import styles from "../../assets/css/ForgotPasswordPage.module.css";
import auth_03 from "../../assets/imgs/auth-03.png";
import AuthBackButton from "../../components/auth/AuthBackButton";
import AuthLabel from "../../components/auth/AuthLabel";
import AuthDescription from "../../components/auth/AuthDescription";
import TextInputGroup from "../../components/auth/TextInputGroup";
import AuthButton from "../../components/auth/AuthButton";
import { useReducer } from "react";
import { forgotPasswordSendOTP } from "../../../api_service/auth_service";
import { useNavigate } from "react-router";

function formReducer(state, action) {
  switch (action.type) {
    case "CHANGE_INPUT_VALUE": {
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
  email: {
    value: "",
    error: "",
  },
};

export default function ForgotPasswordPage() {
  const [formData, dispatch] = useReducer(formReducer, initialValue);
  const { email } = formData;
  const navigate = useNavigate();

  function handleChangeInputValue(e) {
    const action = {
      type: "CHANGE_INPUT_VALUE",
      field: e.target.name,
      value: e.target.value,
    };
    dispatch(action);
  }
  function handleSubmitForm() {
    if (!email.value) {
      notification.error({
        message: "Please enter a valid email address.",
        duration: 3,
      });
      return;
    }

    localStorage.setItem("forgotPasswordEmail", email.value);

    forgotPasswordSendOTP(email.value)
      .then((response) => {
        console.log("OTP sent for forgot password:", response);
        navigate("/auth/verify-otp-forgot");
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Something went wrong. Please try again later.";
        notification.error({
          message: errorMessage,
          duration: 3,
        });
      });
  }
  return (
    <Flex
      justify="space-between"
      align="center"
      className={styles.screenContainer}
    >
      <Flex vertical style={stylesInline.form}>
        <AuthBackButton path="/auth/login">Back to login</AuthBackButton>
        <AuthLabel style={{ marginTop: "1.2rem" }}>
          Forgot your password?
        </AuthLabel>
        <AuthDescription style={{ marginTop: ".6rem" }}>
          Don’t worry, happens to all of us. Enter your email below to recover
          your password
        </AuthDescription>
        <TextInputGroup
          label="Email"
          placeholder="Email"
          name="email"
          value={email.value}
          onChange={handleChangeInputValue}
          style={{ marginTop: "4.08rem" }}
        />
        <AuthButton style={{ marginTop: "2.6rem" }} onClick={handleSubmitForm}>
          Submit
        </AuthButton>
      </Flex>
      <Image src={auth_03} width={500} alt="auth img" preview={false} />
    </Flex>
  );
}

const stylesInline = {
  form: { width: "60.3rem" },
};
