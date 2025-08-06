// Utility for creating/removing HTML forms over p5.js canvas
import { ajax } from "client-logic";

let htmlFormStylesInjected = false;
function injectHtmlFormStyles() {
  if (htmlFormStylesInjected) return;
  htmlFormStylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    form[id$='-form'] {
      background: rgba(255,255,255,0.97);
      padding: 2em 2.5em 1.5em 2.5em;
      border-radius: 14px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.18);
      min-width: 320px;
      max-width: 90vw;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
      border: 1px solid #e0e0e0;
      z-index: 2;
    }
    form[id$='-form'] label {
      display: block;
      margin-bottom: 0.3em;
      font-size: 1.05em;
      color: #222;
      font-weight: 500;
    }
    form[id$='-form'] input[type='text'],
    form[id$='-form'] input[type='email'],
    form[id$='-form'] input[type='password'] {
      width: calc(100% - 2.5em) !important;
      padding: 0.7em 1em;
      margin-bottom: 1.2em;
      border: 1px solid #ccc;
      border-radius: 7px;
      font-size: 1em;
      background: #fafbfc;
      transition: border 0.2s;
    }
    form[id$='-form'] input:focus {
      border: 1.5px solid #007bff;
      outline: none;
      background: #fff;
    }
    form[id$='-form'] button[type='submit'] {
      background: linear-gradient(90deg, #007bff 60%, #0056b3 100%);
      color: #fff;
      border: none;
      border-radius: 7px;
      padding: 0.7em 2.2em;
      font-size: 1.08em;
      font-weight: 600;
      cursor: pointer;
      margin-bottom: 0.5em;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      transition: background 0.2s, box-shadow 0.2s;
    }
    form[id$='-form'] button[type='submit']:hover {
      background: linear-gradient(90deg, #0056b3 60%, #007bff 100%);
      box-shadow: 0 4px 16px rgba(0,0,0,0.13);
    }
    form[id$='-form'] button[type='button'] {
      background: #f3f3f3;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 7px;
      padding: 0.7em 1.5em;
      font-size: 1em;
      margin-left: 0.5em;
      cursor: pointer;
      transition: background 0.2s, border 0.2s;
    }
    form[id$='-form'] button[type='button']:hover {
      background: #e9ecef;
      border: 1px solid #007bff;
    }
    form[id$='-form'] div[id$='-msg'] {
      margin-bottom: 1em;
      font-size: 1em;
      min-height: 1.2em;
      color: #d32f2f;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    form[id$='-form'] div[id$='-msg'].success {
      color: #388e3c;
    }
  `;
  document.head.appendChild(style);
}

// Global array to store all form IDs
export const FORM_IDS = [];

export function removeForms() {
  // Loop over a copy since removeForm will mutate FORM_IDS
  [...FORM_IDS].forEach(id => removeForm(id));
}

export function createForm({
  id,
  fields,
  onSubmit,
  submitText = "Submit",
  extraButtons = [],
}) {
  injectHtmlFormStyles();
  removeForm(id); // Remove any existing form with this id
  // Add id to FORM_IDS if not already present
  if (!FORM_IDS.includes(id)) FORM_IDS.push(id);
  const form = document.createElement("form");
  form.id = id;
  form.style.position = "absolute";
  form.style.left = "50%";
  form.style.top = "50%";
  form.style.transform = "translate(-50%, -50%)";
  form.style.zIndex = 2;
  form.autocomplete = "off";

  fields.forEach(
    ({
      label,
      name,
      type = "text",
      required = false,
      minLength,
      maxLength,
      pattern,
      placeholder,
    }) => {
      const labelEl = document.createElement("label");
      labelEl.textContent = label;
      labelEl.htmlFor = name;
      form.appendChild(labelEl);
      const input = document.createElement("input");
      input.type = type;
      input.name = name;
      input.id = name;
      input.required = required;
      if (minLength) input.minLength = minLength;
      if (maxLength) input.maxLength = maxLength;
      if (pattern) input.pattern = pattern;
      if (placeholder) input.placeholder = placeholder;
      input.style.display = "block";
      input.style.marginBottom = "1em";
      input.style.width = "100%";
      form.appendChild(input);
    }
  );

  const msg = document.createElement("div");
  msg.id = id + "-msg";
  msg.style.marginBottom = "1em";
  form.appendChild(msg);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = submitText;
  submit.style.marginRight = "1em";
  form.appendChild(submit);

  extraButtons.forEach(({ text, onClick, type = "button" }) => {
    const btn = document.createElement("button");
    btn.type = type;
    btn.textContent = text;

    // Set loading text for resend email button
    if (
      text.toLowerCase().includes("resend") ||
      text.toLowerCase().includes("email")
    ) {
      btn.dataset.loadingText = "Sending email...";
    }

    btn.onclick = e => {
      e.preventDefault();
      onClick && onClick(e);
    };
    form.appendChild(btn);
  });

  form.onsubmit = async e => {
    e.preventDefault();
    if (!ajax.busy) {
      msg.textContent = "";

      // Set loading text based on form type
      const formType = id.toLowerCase();
      let loadingText = "Loading...";
      if (formType.includes("login")) {
        loadingText = "Logging in...";
      } else if (formType.includes("signup")) {
        loadingText = "Signing up...";
      } else if (formType.includes("verify")) {
        loadingText = "Verifying...";
      }

      // Store loading text in button dataset
      submit.dataset.loadingText = loadingText;

      // Disable submit button and change text
      const originalText = submit.textContent;
      submit.textContent = loadingText;
      submit.disabled = true;
      submit.style.background =
        "linear-gradient(90deg, #6c757d 60%, #5a6268 100%)";
      submit.style.cursor = "not-allowed";

      // Disable extra buttons too
      const extraButtons = form.querySelectorAll('button[type="button"]');
      extraButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.background = "#f3f3f3";
        btn.style.cursor = "not-allowed";
      });

      const values = {};
      fields.forEach(({ name }) => {
        values[name] = form.elements[name].value;
      });

      try {
        const error = await onSubmit(values, msg);
        if (error) msg.textContent = error;
        else msg.classList.add("success");
      } finally {
        // Restore submit button state
        submit.textContent = originalText;
        submit.disabled = false;
        submit.style.background =
          "linear-gradient(90deg, #007bff 60%, #0056b3 100%)";
        submit.style.cursor = "pointer";

        // Restore extra buttons state
        extraButtons.forEach(btn => {
          btn.disabled = false;
          btn.style.background = "#f3f3f3";
          btn.style.cursor = "pointer";
        });
      }
    }
  };

  document.body.appendChild(form);
  return form;
}

export function removeForm(id) {
  const form = document.getElementById(id);
  if (form) form.remove();
  // Remove id from FORM_IDS if present
  const idx = FORM_IDS.indexOf(id);
  if (idx !== -1) FORM_IDS.splice(idx, 1);
}

export function setFormMessage(id, message, color = "red") {
  const msg = document.getElementById(id + "-msg");
  if (msg) {
    msg.textContent = message;
    msg.style.color = color;
  }
}
