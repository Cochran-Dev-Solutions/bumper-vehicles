# Bumper Vehicles 🚗💥

A multiplayer bumper car combat game inspired by Super Mario Bros boss fights, built with modern web technologies.

## 🎮 Features

- **Multiplayer Gameplay**: Real-time bumper car combat with friends
- **Solo Challenges**: Training academy with missions and achievements
- **Character Collection**: Unique vehicles with asymmetric abilities
- **Power-ups & Arenas**: Strategic gameplay with environmental hazards
- **Community Integration**: Discord server and newsletter updates
- **Beta Testing**: Early access program with email verification
- **Support System**: Ko-Fi integration for community funding

## 🛠️ Tech Stack

### Frontend

- **React** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Vite** - Build tool

### Backend

- **Node.js** - Runtime
- **Fastify** - Web framework
- **MySQL** - Database
- **Nodemailer** - Email service

### Integrations

- **ConvertKit** - Email marketing
- **PayPal** - Payment processing
- **Ko-Fi** - Community funding
- **Discord** - Community platform

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd bumper-vehicles
   ```

2. **Set up the database**

   ```bash
   mysql -u root -p < packages/database/scripts/main.sql
   mysql -u root -p < packages/database/scripts/email_marketing_beta.sql
   ```

3. **Install dependencies**

   ```bash
   # Backend
   cd apps/game-backend
   npm install

   # Frontend
   cd apps/landing-page
   npm install

   # Mailer package
   cd packages/mailer
   npm install
   ```

4. **Configure environment variables**

   ```bash
   # Copy the example env file
   cp apps/game-backend/.env.example apps/game-backend/.env

   # Edit with your credentials
   nano apps/game-backend/.env
   ```

5. **Start the development servers**

   ```bash
   # Backend (from apps/game-backend)
   npm run dev

   # Frontend (from apps/landing-page)
   npm run dev
   ```

## 📧 Email Features

- **Newsletter Subscription**: ConvertKit integration with tags
- **Contact Form**: Email notifications for support requests
- **Beta Credentials**: Automated email sending for beta access
- **Email Verification**: Secure login with email verification

## 💰 Funding & Support

### Ko-Fi Integration

- **Support Button**: Beautiful, animated Ko-Fi button component
- **Multiple Locations**: Hero section, footer, and dedicated support page
- **Customizable**: Easy to update username and styling
- **Responsive**: Works on all device sizes

### PayPal Integration

- **Payment Processing**: Secure payment handling
- **Webhook Support**: Real-time payment notifications
- **Beta Access**: Automatic beta user creation on payment

## 🎯 Beta Testing Program

- **Email Verification**: Secure access with email verification
- **Credential Management**: Automated email sending with credentials
- **Database Tracking**: Complete beta user management
- **Community Integration**: Discord server access

## 📱 Community Features

- **Discord Server**: Real-time community interaction
- **Newsletter**: Regular updates and exclusive content
- **Support System**: Multiple ways to support development
- **Social Integration**: Easy sharing and community building

## 🔧 Configuration

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions including:

- Database configuration
- Email marketing setup (ConvertKit)
- Payment processing (PayPal)
- Funding platforms (Ko-Fi, Buy Me a Coffee)
- Environment variables
- Webhook configuration

## 📁 Project Structure

```
bumper-vehicles/
├── apps/
│   ├── game-backend/          # Backend API server
│   └── landing-page/          # React frontend
├── packages/
│   ├── database/              # Database scripts and DALs
│   └── mailer/                # Email service package
└── docs/                      # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord**: Join our community server
- **Email**: Contact us through the website
- **Ko-Fi**: Support development directly
- **Issues**: Report bugs on GitHub

## 🎮 Play Now

Visit [Bumper Vehicles](https://app.bumpervehicles.com) to start playing!

---

Made with ❤️ by the Bumper Vehicles team
