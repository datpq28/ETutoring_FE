import { useReducer, useState } from "react";
import {
  Link as LinkRouter,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Flex, Image, notification, Typography } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import auth_01 from "../../assets/imgs/auth-01.png";
import styles from "../../assets/css/LoginPage.module.css";
import AuthLabel from "../../components/auth/AuthLabel";
import AuthDescription from "../../components/auth/AuthDescription";
import AuthCheckBox from "../../components/auth/AuthCheckBox";
import AuthButton from "../../components/auth/AuthButton";
import TextInputGroup from "../../components/auth/TextInputGroup";
import PasswordInputGroup from "../../components/auth/PasswordInputGroup";
import AssistanceLink from "../../components/auth/AssistanceLink";
import { loginUser, approveAdmin } from "../../../api_service/auth_service";

const { Link } = Typography;

const initialState = {
  email: { value: "", error: "" },
  password: { value: "", error: "" },
  remember: { checked: false },
};

function formReducer(state, action) {
  switch (action.type) {
    case "CHANGE_VALUE_INPUT":
      return { ...state, [action.field]: { value: action.value, error: "" } };
    case "CHECKED":
      return { ...state, [action.field]: { checked: action.checked } };
    default:
      return state;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dataForm, dispatch] = useReducer(formReducer, initialState);
  const [isPending, setIsPending] = useState(false);
  const [isAdminApproval, setIsAdminApproval] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const { email, password, remember } = dataForm;

  const handleChangeInputValue = (e) => {
    dispatch({
      type: "CHANGE_VALUE_INPUT",
      field: e.target.name,
      value: e.target.value,
    });
  };

  const handleCheckedValue = (e) => {
    dispatch({
      type: "CHECKED",
      field: e.target.name,
      checked: e.target.checked,
    });
  };

  const handleAdminApproval = async () => {
    const token = searchParams.get("token");
    if (!token) {
      notification.error({
        message: "Invalid approval link.",
        duration: 3,
      });
      return;
    }
    try {
      const response = await approveAdmin(token);
      if (response.token) {
        localStorage.setItem("adminToken", response.token);
        navigate("/admin/dashboard");
      } else {
        notification.error({
          message: "Approval failed.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Admin approval failed", error);
      notification.error({
        message: "Admin approval failed.",
        duration: 3,
      });
    }
  };

  if (searchParams.get("token")) {
    handleAdminApproval();
    return null;
  }

  const handleSubmitForm = async () => {
    if (!email.value || !password.value) {
      notification.error({
        message: "Please fill in all fields",
        duration: 3,
      });
      return;
    }
    if (email.value === "admin" && password.value === "admin") {
      navigate("/admin/dashboard");
      return;
    }
    setIsPending(true);
    try {
      const response = await loginUser(email.value, password.value);

      if (response.pendingApproval) {
        setIsAdminApproval(true);
        setAdminEmail(email.value);
        setIsPending(false);
        return;
      }

      localStorage.setItem("loggedInUser", email.value);

      const role = response.role;
      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "tutor") {
        navigate("/tutor/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        notification.error({
          message: "Unknown role. Please contact support.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Login failed", error);
      if (error.response && error.response.data) {
        console.log("Server response:", error.response.data);
        notification.error({
          message: error.response.data.message || "Login Failed",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Login Failed",
          duration: 3,
        });
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Flex
      justify="space-between"
      align="center"
      className={styles.screenContainer}
    >
      <Flex vertical style={stylesInline.form}>
        <AuthLabel>Login</AuthLabel>
        <AuthDescription>
          Login to access your travelwise account
        </AuthDescription>

        <TextInputGroup
          style={{ marginTop: "2.68rem" }}
          inputStyle={{ borderColor: email.error ? "red" : "#000" }}
          allowClear={{
            clearIcon: <CloseCircleOutlined style={stylesInline.clearIcon} />,
          }}
          placeholder="Email"
          value={email.value}
          name="email"
          onChange={handleChangeInputValue}
          autoComplete="off"
        />

        <PasswordInputGroup
          style={{ marginTop: "3rem" }}
          inputStyle={{ borderColor: password.error ? "red" : "#000" }}
          allowClear={{
            clearIcon: <CloseCircleOutlined style={stylesInline.clearIcon} />,
          }}
          placeholder="Password"
          value={password.value}
          name="password"
          onChange={handleChangeInputValue}
        />

        <Flex
          justify="space-between"
          align="center"
          style={{ marginTop: "2.3rem" }}
        >
          <AuthCheckBox
            textStyle={stylesInline.textCheckBox}
            name="remember"
            checked={remember.checked}
            onChange={handleCheckedValue}
          >
            Remember me
          </AuthCheckBox>
          <LinkRouter
            to="/auth/forgot-password"
            component={Link}
            style={stylesInline.linkText}
          >
            Forgot password
          </LinkRouter>
        </Flex>

        <AuthButton
          onClick={handleSubmitForm}
          style={{ marginTop: "4.4rem" }}
          disabled={isPending}
        >
          {isPending ? "Processing..." : "Login"}
        </AuthButton>

        {isAdminApproval && (
          <div style={{ marginTop: "1rem", color: "#D51D1D" }}>
            <p>
              Please check your email ({adminEmail}) for admin approval link.
            </p>
          </div>
        )}

        <AssistanceLink
          text=" Don't have an account?"
          link="Sign up"
          path="/auth/register"
          style={stylesInline.link}
        />
      </Flex>
      <Image src={auth_01} width={500} alt="auth image" preview={false} />
    </Flex>
  );
}

const stylesInline = {
  form: { width: "60.3rem" },
  textCheckBox: {
    color: "#000",
    fontFamily: "Poppins",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineHeight: "normal",
    marginLeft: ".7rem",
  },
  linkText: {
    color: "#D51D1D",
    fontFamily: "Poppins",
    fontSize: "1.6rem",
    fontWeight: 400,
    lineHeight: "normal",
  },
  link: { textAlign: "center" },
  clearIcon: { color: "rgba(0, 0, 0, 0.25)" },
};
