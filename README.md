# Bumper Vehicles 🚗💥

A multiplayer bumper car combat game inspired by Super Mario Bros boss fights, built with modern web technologies. Experience real-time bumper car combat with friends, solo challenges, character collection, and strategic gameplay with power-ups and environmental hazards.

**🎮 [Play Now at bumpervehicles.com](https://bumpervehicles.com)**

## 🛠️ Technology Stack

Built with a modern monorepo architecture using **Node.js**, **Fastify**, **React**, **p5.js**, **React Native**, **Skia**, and **MySQL**. The project features a shared client-logic package for cross-platform game logic, WebSocket-based real-time multiplayer, and a comprehensive physics engine.

📖 **For detailed technology documentation, see our [GitHub Wiki](https://github.com/your-username/bumper-vehicles/wiki)**

## 🚀 Quick Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/bumper-vehicles.git
   cd bumper-vehicles
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy example files
   cp apps/server/env.example.development apps/server/.env
   cp apps/landing-page/env.example apps/landing-page/.env
   ```

4. **Start development servers**

   ```bash
   # Backend server
   cd apps/server && pnpm dev

   # Landing page
   cd apps/landing-page && pnpm dev

   # Web game client
   cd apps/web-client && pnpm dev
   ```

📖 **For detailed setup instructions, see our [GitHub Wiki](https://github.com/your-username/bumper-vehicles/wiki)**

## 🤝 Contributing

We welcome contributions! Join our community to get involved:

- **🎮 [Join our Discord Server](https://discord.gg/bumpervehicles)** - Connect with developers and players
- **🌐 [Visit bumpervehicles.com](https://bumpervehicles.com)** - Learn more about the project
- **📖 [Check our Wiki](https://github.com/your-username/bumper-vehicles/wiki)** - Comprehensive documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by the Bumper Vehicles team
