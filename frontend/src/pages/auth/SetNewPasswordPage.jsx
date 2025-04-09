import { Flex, Image, message  } from "antd";
import auth_03 from "../../assets/imgs/auth-03.png";
import AuthLabel from "../../components/auth/AuthLabel";
import AuthDescription from "../../components/auth/AuthDescription";
import PasswordInputGroup from "../../components/auth/PasswordInputGroup";
import AuthButton from "../../components/auth/AuthButton";
import styles from "../../assets/css/SetNewPasswordPage.module.css";
import AuthBackButton from "../../components/auth/AuthBackButton";
import { useReducer, useState } from "react";

import {updatePassword} from "../../../api_service/auth_service";
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
  password: {
    value: "",
    error: "",
  },
  "re-password": {
    value: "",
    error: "",
  },
};

export default function SetNewPasswordPage() {
  const [dataForm, dispatch] = useReducer(formReducer, initialValue);
  const email = localStorage.getItem("forgotPasswordEmail");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { password, ["re-password"]: rePassword } = dataForm;


  console.log("password>>> ", password);
  console.log("re-password: ", rePassword);

  function handleChangeInputValue(e) {
    const action = {
      type: "CHANGE_INPUT_VALUE",
      field: e.target.name,
      value: e.target.value,
    };
    dispatch(action);
  }

  function handleSubmitForm() {
  if (isSubmitting) return;

  if (!email) {
    message.error("Email is missing. Please try again.");
    return;
  }

  if (!password.value || !rePassword.value) {
    message.error("Please fill in both password fields.");
    return;
  }

  if (password.value !== rePassword.value) {
    message.error("Passwords do not match.");
    return;
  }

  setIsSubmitting(true);
  updatePassword(email, password.value)
    .then(() => {
      message.success("Password updated successfully!");
      localStorage.removeItem("forgotPasswordEmail");
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    })
    .catch(() => {
      message.error("Failed to update password. Try again.");
    })
    .finally(() => {
      setIsSubmitting(false);
    });
}


  return (
    <Flex
      justify="space-between"
      align="center"
      className={styles.screenContainer}
    >
      <Flex vertical style={stylesInline.form}>
        <AuthLabel>Set a password</AuthLabel>
        <AuthDescription style={stylesInline.authDescription}>
          Your previous password has been reseted. Please set a new password for
          your account.
        </AuthDescription>
        <PasswordInputGroup
          label="Create Password"
          placeholder="Create Password"
          name="password"
          value={password.value}
          onChange={handleChangeInputValue}
          style={{ marginTop: "4.08rem" }}
        />
        <PasswordInputGroup
          label="Re-enter Password"
          placeholder="Re-enter Password"
          name="re-password"
          value={rePassword.value}
          onChange={handleChangeInputValue}
          style={{ marginTop: "2.1rem" }}
        />
        <AuthButton style={stylesInline.button} onClick={handleSubmitForm}>
          Submit
        </AuthButton>
        <AuthBackButton>Back to login</AuthBackButton>
      </Flex>
      <Image width={450} src={auth_03} alt="auth img" preview={false} />
    </Flex>
  );
}

const stylesInline = {
  form: {
    width: "60.3rem",
  },
  authDescription: {
    marginTop: ".6rem",
  },
  button: {
    marginTop: "3.3rem",
  },
};
