import { sceneManager, ajax, Button } from "@bv-frontend-logic";
import { createForm, removeForm, setFormMessage } from "../render-tools/htmlForms.js";

const SIGNUP_FORM_ID = "signup-form";
const VERIFY_FORM_ID = "verify-form";

const buttons = {
  menu: new Button({
    x: 30,
    y: 30,
    width: 90,
    height: 40,
    display: function () {
      this.p.noStroke();
      this.p.fill(200, 200, 200, 200);
      this.p.rect(this.x, this.y, this.width, this.height, 8);
      this.p.fill(0);
      this.p.textSize(18);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.text("Menu", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: () => {
      sceneManager.createTransition("menu");
    },
  }),
};

const signupScene = {
  name: "Signup",
  init: function () {
    this.verifying = false;
    this.email = null;
    this.showSignupForm();
  },
  display: function () {
    Button.setAlignment("top", "left");
    buttons["menu"].update(30, 30);
  },
  showSignupForm: function () {
    createForm({
      id: SIGNUP_FORM_ID,
      fields: [
        {
          label: "Username",
          name: "username",
          type: "text",
          required: true,
          minLength: 3,
          maxLength: 50,
          pattern: "^[a-zA-Z0-9_]+$",
          placeholder: "Choose a username",
        },
        {
          label: "Email",
          name: "email",
          type: "email",
          required: true,
          placeholder: "Enter your email",
        },
        {
          label: "Password",
          name: "password",
          type: "password",
          required: true,
          minLength: 8,
          placeholder: "Password (min 8 chars)",
        },
        {
          label: "Confirm Password",
          name: "confirm",
          type: "password",
          required: true,
          minLength: 8,
          placeholder: "Confirm password",
        },
      ],
      submitText: "Sign Up",
      onSubmit: async (values, msg) => {
        if (
          !values.username ||
          !values.email ||
          !values.password ||
          !values.confirm
        )
          return "All fields required.";
        if (!/^[a-zA-Z0-9_]+$/.test(values.username))
          return "Username must be alphanumeric (letters, numbers, underscores).";
        if (values.username.length < 3)
          return "Username must be at least 3 characters.";
        if (values.password !== values.confirm)
          return "Passwords do not match.";
        if (values.password.length < 8)
          return "Password must be at least 8 characters.";
        const res = await ajax.post("/signup", {
          username: values.username,
          email: values.email,
          password: values.password,
        });
        if (!res.ok) return res.error || "Signup failed.";
        setFormMessage(
          SIGNUP_FORM_ID,
          "Signup successful! Check your email for a code.",
          "green"
        );
        this.email = values.email;
        setTimeout(() => {
          removeForm(SIGNUP_FORM_ID);
          this.showVerifyForm();
        }, 800);
      },
    });
  },
  showVerifyForm: function () {
    createForm({
      id: VERIFY_FORM_ID,
      fields: [
        {
          label: "Verification Code",
          name: "verification_code",
          type: "text",
          required: true,
          placeholder: "Enter code from email",
        },
      ],
      submitText: "Verify",
      extraButtons: [
        {
          text: "Resend Email",
          onClick: async function (e) {
            if (!signupScene.email)
              return setFormMessage(VERIFY_FORM_ID, "No email to resend to.");

            // Get the button element and pass it to AJAX for state management
            const button = e.target;
            const res = await ajax.post(
              "/resend-verification",
              {
                email: signupScene.email,
              },
              null,
              button
            );

            if (!res.ok) {
              setFormMessage(VERIFY_FORM_ID, res.error || "Failed to resend.");
            } else {
              setFormMessage(
                VERIFY_FORM_ID,
                "Verification email resent! Check your inbox.",
                "green"
              );
            }
          },
        },
      ],
      onSubmit: async (values, msg) => {
        if (!values.verification_code) return "Code required.";
        const res = await ajax.post("/verify", {
          email: this.email,
          verification_code: values.verification_code,
        });
        if (!res.ok) return res.error || "Verification failed.";
        setFormMessage(
          VERIFY_FORM_ID,
          "Verified! Redirecting to login...",
          "green"
        );
        setTimeout(() => {
          removeForm(VERIFY_FORM_ID);
          sceneManager.createTransition("login");
        }, 1000);
      },
    });
  },
  buttons: Object.values(buttons),
};

export default signupScene;
