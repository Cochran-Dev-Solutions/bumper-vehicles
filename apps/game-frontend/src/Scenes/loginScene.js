import sceneManager from "../EventObjects/SceneManager.js";
import { createForm, removeForm, setFormMessage } from "../utils/htmlForms.js";
import ajax from "../networking/ajax.js";
import Button from "../EventObjects/Button.js";

const FORM_ID = "login-form";

const buttons = {
  menu: new Button({
    x: 30,
    y: 30,
    width: 90,
    height: 40,
    display: function () {
      const p = sceneManager.getCanvas();
      if (!p) return;
      p.noStroke();
      p.fill(200, 200, 200, 200);
      p.rect(this.x, this.y, this.width, this.height, 8);
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Menu", this.x + this.width / 2, this.y + this.height / 2);
    },
    onClick: () => {
      sceneManager.createTransition("menu");
    },
  }),
};

const loginScene = {
  name: "Login",
  init: function () {
    removeForm(FORM_ID);

    createForm({
      id: FORM_ID,
      fields: [
        {
          label: "Email or Username",
          name: "identifier",
          type: "text",
          required: true,
          placeholder: "Enter your email or username",
        },
        {
          label: "Password",
          name: "password",
          type: "password",
          required: true,
          minLength: 6,
          placeholder: "Enter your password",
        },
      ],
      submitText: "Login",
      onSubmit: async (values, msg) => {
        if (!values.identifier || !values.password)
          return "All fields required.";
        const res = await ajax.post("/login", {
          identifier: values.identifier,
          password: values.password,
        });
        if (!res.ok) return res.error || "Login failed.";
        // Set user fields
        if (!sceneManager.user) sceneManager.user = {};
        sceneManager.user.logged_in = true;
        if (res.data && res.data.username)
          sceneManager.user.username = res.data.username;
        if (res.data && res.data.email)
          sceneManager.user.email = res.data.email;
        if (res.data && res.data.display_name)
          sceneManager.user.display_name = res.data.display_name;
        setFormMessage(FORM_ID, "Login successful!", "green");
        setTimeout(() => {
          removeForm(FORM_ID);
          sceneManager.createTransition("menu");
        }, 800);
      },
    });
  },
  display: function () {
    // Draw the menu button
    Button.setAlignment("left", "top");
    if (buttons["menu"]) buttons["menu"].update(30, 30);
  },
  cleanup: function () {
    removeForm(FORM_ID);
  },
  buttons: Object.values(buttons),
};

export default loginScene;
