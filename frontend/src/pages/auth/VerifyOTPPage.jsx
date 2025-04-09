import { Flex, Image, notification } from "antd";
import styles from "../../assets/css/VerifyOTPPage.module.css";
import auth_01 from "../../assets/imgs/auth-01.png";
import AuthBackButton from "../../components/auth/AuthBackButton";
import AuthLabel from "../../components/auth/AuthLabel";
import AuthDescription from "../../components/auth/AuthDescription";
import TextInputGroup from "../../components/auth/TextInputGroup";
import AuthButton from "../../components/auth/AuthButton";
import AssistanceLink from "../../components/auth/AssistanceLink";
import { useReducer } from "react";
import { registerVerifyOTP } from "../../../api_service/auth_service";
import { useLocation, useNavigate } from "react-router";
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
  code: {
    value: "",
    error: "",
  },
};

export default function VerifyOTPPage() {
  const [formData, dispatch] = useReducer(formReducer, initialValue);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { code } = formData;
  function handleChangeInputValue(e) {
    const action = {
      type: "CHANGE_INPUT_VALUE",
      field: e.target.name,
      value: e.target.value,
    };
    dispatch(action);
  }
  function handleSubmitForm() {
    if (!email) {
      notification.error({
        message: "Email not found, please register again.",
        duration: 3,
      });
      navigate("/auth/register");
      return;
    }

    registerVerifyOTP(email, code.value)
      .then((response) => {
        console.log("Verify OTP successful", response);
        navigate("/auth/login");
      })
      .catch((error) => {
        console.error("Wrong OTP", error);
        notification.error({
          message: error.response?.data?.message || "Verify Failed",
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
      <Flex vertical>
        <AuthBackButton path="/auth/login">Back to login</AuthBackButton>
        <AuthLabel style={{ marginTop: "1rem" }}>Verify code</AuthLabel>
        <AuthDescription style={{ marginTop: ".6rem" }}>
          An authentication code has been sent to your email.
        </AuthDescription>
        <TextInputGroup
          label="Enter Code"
          name="code"
          placeholder="Code"
          value={code.value}
          onChange={handleChangeInputValue}
          style={{ marginTop: "4.9rem" }}
        />
        <AssistanceLink
          text="Didn’t receive a code?"
          link="Resend"
          path="/"
          style={{ marginTop: "2.6rem" }}
        />
        <AuthButton onClick={handleSubmitForm} style={{ marginTop: "4.6rem" }}>
          Verify
        </AuthButton>
      </Flex>
      <Image src={auth_01} width={500} alt="auth img" preview={false} />
    </Flex>
  );
}
