// library for sending common AJAX requests to the back-end
// get user data, etc.

class AJAX {
  constructor() {
    const nodeEnv = import.meta.env.VITE_NODE_ENV;
    let apiUrl;
    
    if (nodeEnv === 'production') {
      apiUrl = import.meta.env.VITE_PROD_API_URL || 'https://api.bumpervehicles.com';
    } else {
      apiUrl = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3000';
    }
    
    console.log('AJAX initialized with API URL:', apiUrl, 'Environment:', nodeEnv);
    this.baseURL = apiUrl;
  }

  async request(
    path,
    { method = "GET", body = null, headers = {}, button = null } = {}
  ) {
    // Handle HTML button state if provided
    let originalButtonState = null;
    if (button && button instanceof HTMLButtonElement) {
      originalButtonState = {
        disabled: button.disabled,
        text: button.textContent,
        style: button.style.background,
      };

      // Disable button and change appearance
      button.disabled = true;
      button.textContent = button.dataset.loadingText || "Loading...";
      button.style.background =
        "linear-gradient(90deg, #6c757d 60%, #5a6268 100%)";
      button.style.cursor = "not-allowed";
    }

    const opts = {
      method,
      headers: {
        ...headers,
      },
      credentials: "include", // for cookies/session
    };
    if (body) {
      opts.body = JSON.stringify(body);
      opts.headers["Content-Type"] = "application/json";
    }
    let res, data;
    try {
      res = await fetch(this.baseURL + path, opts);
      data = await res.json().catch(() => ({}));
    } catch (err) {
      // Restore button state on error
      if (button && originalButtonState) {
        this.restoreButtonState(button, originalButtonState);
      }
      return { ok: false, error: "Network error", status: 0 };
    }

    // Restore button state after request completes
    if (button && originalButtonState) {
      this.restoreButtonState(button, originalButtonState);
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
      error: !res.ok ? data.message || data.error || "Unknown error" : null,
    };
  }

  restoreButtonState(button, originalState) {
    button.disabled = originalState.disabled;
    button.textContent = originalState.text;
    button.style.background = originalState.style;
    button.style.cursor = "pointer";
  }

  get(path, headers, button) {
    return this.request(path, { method: "GET", headers, button });
  }
  post(path, body, headers, button) {
    return this.request(path, { method: "POST", body, headers, button });
  }
  put(path, body, headers, button) {
    return this.request(path, { method: "PUT", body, headers, button });
  }
  delete(path, body, headers, button) {
    return this.request(path, { method: "DELETE", body, headers, button });
  }
}

const ajax = new AJAX();
export default ajax;
