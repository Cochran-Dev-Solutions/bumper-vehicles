import { sceneManager, ajax, Button } from "client-logic";
import {
  createForm,
  removeForm,
  setFormMessage,
} from "../render-tools/htmlForms.js";

const FORM_ID = "beta-auth-form";

const betaAuthScene = {
  name: "BetaAuth",
  init: function () {
    createForm({
      id: FORM_ID,
      fields: [
        {
          label: "Beta Username",
          name: "beta_username",
          type: "text",
          required: true,
          placeholder: "Enter your beta username",
          autocomplete: "off",
        },
        {
          label: "Beta Password",
          name: "beta_password",
          type: "password",
          required: true,
          minLength: 1,
          placeholder: "Enter your beta password",
          autocomplete: "new-password",
        },
      ],
      submitText: "Access Beta",
      onSubmit: async (values, msg) => {
        if (!values.beta_username || !values.beta_password)
          return "All fields required.";
        const res = await ajax.post("/beta-auth", {
          username: values.beta_username,
          password: values.beta_password,
        });
        if (!res.ok) return res.error || "Authentication failed.";
        // Store authentication data
        const authData = {
          ...res.data,
          authenticatedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days
        };
        localStorage.setItem("bumper_beta_auth", JSON.stringify(authData));
        setFormMessage(FORM_ID, "Beta authentication successful!", "green");
        setTimeout(() => {
          removeForm(FORM_ID);
          sceneManager.createTransition("menu");
        }, 800);
      },
    });
  },
  display: function () {
    // Draw title
    this.p.fill(255);
    this.p.textSize(32);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("Bumper Vehicles Beta Test Login", this.p.width / 2, 100);
  },
  buttons: [],
};

export default betaAuthScene;
