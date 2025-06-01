import p5 from 'p5';

class UserTest {
  constructor() {
    this.username = '';
    this.email = '';
    this.password = '';
    this.message = '';
    this.messageColor = [255, 255, 255];
  }

  async createAccount() {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        this.message = 'Account created successfully!';
        this.messageColor = [0, 255, 0]; // Green
      } else {
        this.message = data.message || 'Failed to create account';
        this.messageColor = [255, 0, 0]; // Red
      }
    } catch (error) {
      this.message = 'Error: ' + error.message;
      this.messageColor = [255, 0, 0]; // Red
    }
  }
}

// Create a new sketch
const sketch = (p) => {
  const userTest = new UserTest();
  let usernameInput, emailInput, passwordInput, submitButton;

  p.setup = () => {
    p.createCanvas(400, 500);
    p.background(51);

    // Create input fields
    usernameInput = p.createInput('');
    usernameInput.position(50, 100);
    usernameInput.size(300);

    emailInput = p.createInput('');
    emailInput.position(50, 200);
    emailInput.size(300);

    passwordInput = p.createInput('');
    passwordInput.position(50, 300);
    passwordInput.size(300);
    passwordInput.attribute('type', 'password');

    // Create submit button
    submitButton = p.createButton('Create Account');
    submitButton.position(150, 400);
    submitButton.mousePressed(() => {
      userTest.username = usernameInput.value();
      userTest.email = emailInput.value();
      userTest.password = passwordInput.value();
      userTest.createAccount();
    });
  };

  p.draw = () => {
    p.background(51);

    // Draw labels
    p.fill(255);
    p.textSize(16);
    p.text('Username:', 50, 80);
    p.text('Email:', 50, 180);
    p.text('Password:', 50, 280);

    // Draw message if any
    if (userTest.message) {
      p.fill(...userTest.messageColor);
      p.textSize(14);
      p.text(userTest.message, 50, 450);
    }
  };
};

// Create new p5 instance with our sketch
new p5(sketch);