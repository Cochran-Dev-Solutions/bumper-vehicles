# UML Diagrams

## Overview

This document provides comprehensive UML diagrams for the Bumper Vehicles project, including class diagrams, sequence diagrams, and architecture diagrams. These diagrams help visualize the system's structure, relationships, and interactions.

## Class Diagrams

### Core Game Engine Classes

```mermaid
classDiagram
    class Game {
        -sessionId: String
        -status: GameStatus
        -players: Map~String, Player~
        -entities: Map~String, Entity~
        -physicsWorld: PhysicsWorld
        -gameLogic: GameLogic
        +constructor(sessionId, config)
        +update(deltaTime)
        +addPlayer(playerId, playerData)
        +removePlayer(playerId)
        +getGameState()
        +saveGameState()
        +loadGameState(stateData)
    }

    class PhysicsWorld {
        -entities: Map~String, PhysicsEntity~
        -staticEntities: Map~String, PhysicsEntity~
        -dynamicEntities: Map~String, PhysicsEntity~
        -spatialGrid: SpatialGrid
        -collisionMatrix: CollisionMatrix
        +constructor(config)
        +update(deltaTime)
        +addEntity(entity)
        +removeEntity(entityId)
        +getEntity(entityId)
        +performCollisionDetection()
    }

    class GameRenderer {
        -canvas: HTMLCanvasElement
        -p5: p5
        -config: RendererConfig
        -renderingState: RenderingState
        -assetManager: AssetManager
        -textureCache: Map~String, Image~
        +constructor(canvas, config)
        +setup(p)
        +draw(p)
        +renderScene(p, scene)
        +renderEntity(p, entity)
        +renderSprite(p, sprite, entity)
        +updateCamera()
        +getPerformanceStats()
    }

    class SceneManager {
        -currentScene: Scene
        -previousScene: Scene
        -sceneStack: Scene[]
        -uiState: UIState
        -scenes: Map~String, Scene~
        +constructor()
        +setCurrentScene(sceneName, params)
        +setUIState(key, value)
        +setModalState(modalId, isActive, data)
        +getCurrentScene()
        +getUIState(key)
        +saveUserPreferences()
        +loadUserPreferences()
    }

    class PlayerEntity {
        -characterId: String
        -playerName: String
        -health: Number
        -maxHealth: Number
        -score: Number
        -isAlive: Boolean
        -activePowerups: Map~String, Boolean~
        -powerupTimers: Map~String, Number~
        -inputState: InputState
        +constructor(id, config)
        +update(deltaTime)
        +handleInput(deltaTime)
        +addPowerup(powerupType, duration)
        +removePowerup(powerupType)
        +takeDamage(amount)
        +respawn(position)
        +getPlayerState()
    }

    class PhysicsEntity {
        -id: String
        -type: String
        -collisionType: String
        -collisionGroup: String
        -position: Vector2D
        -velocity: Vector2D
        -acceleration: Vector2D
        -rotation: Number
        -angularVelocity: Number
        -mass: Number
        -restitution: Number
        -friction: Number
        -radius: Number
        -width: Number
        -height: Number
        -boundingBox: BoundingBox
        -isActive: Boolean
        -isStatic: Boolean
        -forces: Force[]
        +constructor(id, config)
        +updateBoundingBox()
        +addForce(force)
        +clearForces()
        +setPosition(x, y)
        +setVelocity(x, y)
        +getPhysicsState()
        +clone()
    }

    class BoundingBox {
        -x: Number
        -y: Number
        -width: Number
        -height: Number
        +constructor(x, y, width, height)
        +intersects(other)
        +contains(point)
        +expand(amount)
        +union(other)
        +getCenter()
        +getArea()
    }

    class AssetManager {
        -images: Map~String, Image~
        -animations: Map~String, Animation~
        -sounds: Map~String, Audio~
        -fonts: Map~String, Font~
        -loadingQueue: AssetConfig[]
        -loadedAssets: Number
        -totalAssets: Number
        +constructor()
        +loadAssets()
        +loadAsset(assetConfig)
        +loadImage(config)
        +loadAnimation(config)
        +loadSound(config)
        +getImage(name)
        +getAnimation(name)
        +getSound(name)
        +getLoadingProgress()
        +isLoaded()
    }

    class AnimatedSprite {
        -animation: Animation
        -config: SpriteConfig
        -currentFrame: Number
        -frameTime: Number
        -frameDuration: Number
        -isPlaying: Boolean
        -isFinished: Boolean
        +constructor(animation, config)
        +update(deltaTime)
        +getCurrentFrame()
        +play()
        +pause()
        +stop()
        +reset()
        +setFrameRate(frameRate)
        +isAnimationFinished()
    }

    Game --> PhysicsWorld : uses
    Game --> PlayerEntity : contains
    Game --> PhysicsEntity : contains
    GameRenderer --> AssetManager : uses
    GameRenderer --> AnimatedSprite : renders
    SceneManager --> GameRenderer : controls
    PlayerEntity --> PhysicsEntity : extends
    PhysicsEntity --> BoundingBox : has
    AssetManager --> AnimatedSprite : provides
```

### Database and API Classes

```mermaid
classDiagram
    class Database {
        -pool: ConnectionPool
        -config: DatabaseConfig
        +constructor(config)
        +getConnection()
        +execute(query, params)
        +transaction(callback)
    }

    class UserDAL {
        -db: Database
        +constructor(db)
        +create(userData)
        +findByEmail(email)
        +findById(id)
        +update(id, updates)
        +delete(id)
        +findAll(limit, offset)
    }

    class User {
        -id: Number
        -email: String
        -passwordHash: String
        -username: String
        -isVerified: Boolean
        -isBetaUser: Boolean
        -createdAt: Date
        -lastLogin: Date
        -profileData: Object
        +constructor(data)
        +static validate(userData)
        +toJSON()
        +validatePassword(password)
        +updateProfile(updates)
    }

    class GameSession {
        -id: Number
        -sessionId: String
        -hostUserId: Number
        -gameType: String
        -mapId: String
        -maxPlayers: Number
        -currentPlayers: Number
        -status: String
        -createdAt: Date
        -startedAt: Date
        -endedAt: Date
        -gameData: Object
        +constructor(data)
        +toJSON()
        +isActive()
        +canJoin()
        +addPlayer(playerId)
        +removePlayer(playerId)
    }

    class FastifyApp {
        -server: FastifyInstance
        -routes: Route[]
        -plugins: Plugin[]
        -middleware: Middleware[]
        +constructor()
        +register(plugin)
        +addRoute(route)
        +addMiddleware(middleware)
        +start()
        +stop()
    }

    class AuthController {
        -userDAL: UserDAL
        -jwtService: JWTService
        -emailService: EmailService
        +constructor(userDAL, jwtService, emailService)
        +register(request, reply)
        +login(request, reply)
        +verifyEmail(request, reply)
        +forgotPassword(request, reply)
        +resetPassword(request, reply)
        +refreshToken(request, reply)
    }

    class GameController {
        -gameDAL: GameDAL
        -websocketManager: WebSocketManager
        +constructor(gameDAL, websocketManager)
        +createGame(request, reply)
        +joinGame(request, reply)
        +leaveGame(request, reply)
        +getGameState(request, reply)
        +getActiveGames(request, reply)
    }

    class WebSocketManager {
        -sessions: Map~String, Game~
        -playerSessions: Map~String, PlayerSession~
        -io: SocketIOServer
        +constructor(io)
        +handleConnection(socket)
        +handleDisconnection(socket)
        +handleJoinGame(socket, data)
        +handleLeaveGame(socket, data)
        +handlePlayerInput(socket, data)
        +broadcastGameState(sessionId)
        +createSession(sessionId, config)
        +destroySession(sessionId)
    }

    Database --> UserDAL : provides
    UserDAL --> User : manages
    UserDAL --> GameSession : manages
    FastifyApp --> AuthController : uses
    FastifyApp --> GameController : uses
    GameController --> WebSocketManager : uses
    WebSocketManager --> GameSession : manages
```

### Client-Side Architecture

```mermaid
classDiagram
    class ClientApp {
        -sceneManager: SceneManager
        -gameRenderer: GameRenderer
        -inputManager: InputManager
        -networkManager: NetworkManager
        -assetManager: AssetManager
        +constructor()
        +initialize()
        +start()
        +stop()
        +update(deltaTime)
    }

    class InputManager {
        -keyStates: Map~String, Boolean~
        -mousePosition: Vector2D
        -mouseButtons: Map~Number, Boolean~
        -touchEvents: TouchEvent[]
        +constructor()
        +update()
        +isKeyPressed(key)
        +isMouseButtonPressed(button)
        +getMousePosition()
        +getTouchEvents()
        +clearTouchEvents()
    }

    class NetworkManager {
        -socket: Socket
        -connectionStatus: ConnectionStatus
        -reconnectAttempts: Number
        -maxReconnectAttempts: Number
        +constructor(url)
        +connect()
        +disconnect()
        +send(event, data)
        +on(event, callback)
        +emit(event, data)
        +reconnect()
    }

    class GameState {
        -sessionId: String
        -gameStatus: String
        -timeRemaining: Number
        -players: Map~String, Player~
        -entities: Map~String, Entity~
        -localPlayerId: String
        +constructor()
        +update(newState)
        +getPlayer(playerId)
        +getLocalPlayer()
        +getEntities()
        +getPlayers()
    }

    class EventEmitter {
        -events: Map~String, Function[]~
        +constructor()
        +on(event, callback)
        +off(event, callback)
        +emit(event, data)
        +once(event, callback)
        +removeAllListeners(event)
    }

    class Vector2D {
        -x: Number
        -y: Number
        +constructor(x, y)
        +add(vector)
        +subtract(vector)
        +multiply(scalar)
        +divide(scalar)
        +magnitude()
        +normalize()
        +distance(vector)
        +dot(vector)
        +cross(vector)
    }

    ClientApp --> SceneManager : uses
    ClientApp --> GameRenderer : uses
    ClientApp --> InputManager : uses
    ClientApp --> NetworkManager : uses
    ClientApp --> AssetManager : uses
    GameRenderer --> GameState : renders
    NetworkManager --> GameState : updates
    InputManager --> EventEmitter : extends
    GameState --> Vector2D : uses
```

## Sequence Diagrams

### Player Joining Game Session

```mermaid
sequenceDiagram
    participant Client as Game Client
    participant API as Backend API
    participant WS as WebSocket Manager
    participant Game as Game Engine
    participant DB as Database

    Client->>API: POST /api/games/create
    API->>DB: Create game session
    DB-->>API: Session created
    API-->>Client: Session ID returned

    Client->>WS: Connect to WebSocket
    WS->>Game: Create game instance
    Game-->>WS: Game created
    WS-->>Client: Connection established

    Client->>WS: emit 'join-game'
    Note over WS: {sessionId, playerName, characterId}
    WS->>Game: addPlayer(playerId, playerData)
    Game->>Game: Create PlayerEntity
    Game->>Game: Add to physics world
    Game-->>WS: Player added
    WS->>WS: Broadcast 'player-joined'
    WS-->>Client: emit 'player-joined'
    WS-->>Client: emit 'game-state-update'

    loop Game Loop
        Game->>Game: Update physics
        Game->>Game: Update game logic
        Game->>Game: Perform collision detection
        Game->>WS: Broadcast state updates
        WS-->>Client: emit 'game-state-update'
        Client->>Client: Update GameRenderer
    end
```

### Real-time Game State Synchronization

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant P2 as Player 2
    participant WS as WebSocket Manager
    participant Game as Game Engine
    participant Physics as Physics World

    P1->>WS: emit 'player-input'
    Note over P1: {up: true, right: true}
    WS->>Game: updatePlayerInput(playerId, input)
    Game->>Physics: updatePlayerPhysics(playerId, input)
    Physics->>Physics: Apply forces and update position
    Physics-->>Game: Updated physics state
    Game->>Game: Update game state
    Game->>WS: Broadcast state update
    WS-->>P1: emit 'game-state-update'
    WS-->>P2: emit 'game-state-update'

    P2->>WS: emit 'player-input'
    Note over P2: {down: true, left: true}
    WS->>Game: updatePlayerInput(playerId, input)
    Game->>Physics: updatePlayerPhysics(playerId, input)
    Physics->>Physics: Apply forces and update position
    Physics->>Physics: Check collisions
    Physics-->>Game: Collision detected
    Game->>Game: Handle collision response
    Game->>Game: Update game state
    Game->>WS: Broadcast state update
    WS-->>P1: emit 'game-state-update'
    WS-->>P2: emit 'game-state-update'
```

### Asset Loading Process

```mermaid
sequenceDiagram
    participant App as Client App
    participant AM as Asset Manager
    participant GR as Game Renderer
    participant Cache as Texture Cache

    App->>AM: loadAssets()
    AM->>AM: getAssetList()
    AM->>AM: Create loading promises

    par Load Images
        AM->>AM: loadImage(config)
        AM->>Cache: Store image
        Cache-->>AM: Image cached
    and Load Animations
        AM->>AM: loadAnimation(config)
        loop For each frame
            AM->>AM: loadImage(frameConfig)
            AM->>Cache: Store frame
        end
        Cache-->>AM: Animation cached
    and Load Sounds
        AM->>AM: loadSound(config)
        AM->>Cache: Store audio
        Cache-->>AM: Audio cached
    end

    AM-->>App: All assets loaded
    App->>GR: Initialize renderer
    GR->>Cache: Get cached assets
    Cache-->>GR: Assets provided
    GR->>GR: Setup rendering pipeline
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Client as Client App
    participant API as Backend API
    participant Auth as Auth Controller
    participant DB as Database
    participant Email as Email Service

    User->>Client: Enter credentials
    Client->>API: POST /api/auth/login
    API->>Auth: login(request, reply)
    Auth->>DB: findByEmail(email)
    DB-->>Auth: User data
    Auth->>Auth: validatePassword(password)
    Auth->>Auth: generateJWT(user)
    Auth->>DB: updateLastLogin(userId)
    Auth-->>API: JWT token + user data
    API-->>Client: Authentication successful
    Client->>Client: Store token
    Client->>Client: Update UI state

    alt Email verification required
        Auth->>Email: sendVerificationEmail(user)
        Email-->>Auth: Email sent
        API-->>Client: Verification email sent
    end

    Client->>API: GET /api/users/profile
    Note over Client: Include JWT token
    API->>Auth: verifyToken(token)
    Auth->>DB: findById(userId)
    DB-->>Auth: User profile
    Auth-->>API: User profile data
    API-->>Client: Profile data
    Client->>Client: Update user interface
```

## Architecture Diagrams

### System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Client<br/>React + p5.js]
        Mobile[Mobile Client<br/>React Native + Skia]
        Landing[Landing Page<br/>React + Tailwind]
    end

    subgraph "API Layer"
        API[Backend API<br/>Fastify + Node.js]
        WS[WebSocket Server<br/>Socket.IO]
    end

    subgraph "Business Logic"
        Game[Game Engine<br/>Physics + Logic]
        Auth[Authentication<br/>JWT + bcrypt]
        Email[Email Service<br/>Nodemailer]
        Payment[Payment Service<br/>PayPal]
    end

    subgraph "Data Layer"
        DB[(MySQL Database)]
        Redis[(Redis Cache)]
        S3[(AWS S3<br/>Assets)]
    end

    subgraph "External Services"
        ConvertKit[ConvertKit<br/>Email Marketing]
        Discord[Discord<br/>Community]
        KoFi[Ko-Fi<br/>Funding]
    end

    Web --> API
    Mobile --> API
    Landing --> API
    Web --> WS
    Mobile --> WS
    API --> Game
    API --> Auth
    API --> Email
    API --> Payment
    Game --> DB
    Auth --> DB
    Email --> DB
    Payment --> DB
    API --> Redis
    Game --> Redis
    API --> S3
    Email --> ConvertKit
    Payment --> KoFi
```

### Monorepo Structure

```mermaid
graph TD
    subgraph "Root"
        Root[package.json<br/>pnpm-workspace.yaml]
    end

    subgraph "Applications"
        Server[apps/server<br/>Backend API]
        WebClient[apps/web-client<br/>Game Client]
        MobileClient[apps/mobile-client<br/>Mobile App]
        LandingPage[apps/landing-page<br/>Landing Page]
    end

    subgraph "Shared Packages"
        ClientLogic[packages/client-logic<br/>Game Logic]
        Database[packages/database<br/>Database Layer]
        Mailer[packages/mailer<br/>Email Service]
        Payment[packages/payment<br/>Payment Service]
        Redis[packages/redis<br/>Cache Service]
    end

    Root --> Server
    Root --> WebClient
    Root --> MobileClient
    Root --> LandingPage

    WebClient --> ClientLogic
    MobileClient --> ClientLogic
    Server --> Database
    Server --> Mailer
    Server --> Payment
    Server --> Redis
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Input Layer"
        Keyboard[Keyboard Input]
        Mouse[Mouse Input]
        Touch[Touch Input]
        Network[Network Input]
    end

    subgraph "Processing Layer"
        InputManager[Input Manager]
        GameLogic[Game Logic]
        PhysicsEngine[Physics Engine]
        NetworkManager[Network Manager]
    end

    subgraph "State Layer"
        GameState[Game State]
        PlayerState[Player State]
        EntityState[Entity State]
        UIState[UI State]
    end

    subgraph "Output Layer"
        Renderer[Game Renderer]
        AudioEngine[Audio Engine]
        NetworkOutput[Network Output]
        UI[User Interface]
    end

    Keyboard --> InputManager
    Mouse --> InputManager
    Touch --> InputManager
    Network --> NetworkManager

    InputManager --> GameLogic
    GameLogic --> PhysicsEngine
    NetworkManager --> GameLogic

    GameLogic --> GameState
    PhysicsEngine --> EntityState
    GameLogic --> PlayerState
    InputManager --> UIState

    GameState --> Renderer
    EntityState --> Renderer
    PlayerState --> Renderer
    UIState --> UI
    GameState --> AudioEngine
    GameState --> NetworkOutput
```

### Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevLocal[Local Development]
        DevDocker[Docker Development]
    end

    subgraph "Staging"
        StagingAPI[Staging API<br/>EC2 Instance]
        StagingDB[Staging Database<br/>RDS]
        StagingCDN[Staging CDN<br/>CloudFront]
    end

    subgraph "Production"
        ProdAPI[Production API<br/>EC2 Auto Scaling]
        ProdDB[Production Database<br/>RDS Multi-AZ]
        ProdCDN[Production CDN<br/>CloudFront]
        ProdS3[Asset Storage<br/>S3]
    end

    subgraph "CI/CD"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        ECR[ECR Container Registry]
    end

    subgraph "Monitoring"
        CloudWatch[CloudWatch<br/>Logs & Metrics]
        AlertManager[Alert Manager]
        Dashboard[Monitoring Dashboard]
    end

    DevLocal --> StagingAPI
    DevDocker --> StagingAPI
    GitHub --> Actions
    Actions --> ECR
    ECR --> StagingAPI
    ECR --> ProdAPI

    StagingAPI --> StagingDB
    ProdAPI --> ProdDB
    ProdAPI --> ProdS3

    StagingAPI --> CloudWatch
    ProdAPI --> CloudWatch
    CloudWatch --> AlertManager
    CloudWatch --> Dashboard
```

## Component Diagrams

### Game Engine Components

```mermaid
graph TB
    subgraph "Core Engine"
        GameCore[Game Core]
        PhysicsCore[Physics Core]
        RenderCore[Render Core]
        NetworkCore[Network Core]
    end

    subgraph "Entity System"
        PlayerSystem[Player System]
        EntitySystem[Entity System]
        PowerupSystem[Powerup System]
        ParticleSystem[Particle System]
    end

    subgraph "Input System"
        KeyboardInput[Keyboard Input]
        MouseInput[Mouse Input]
        TouchInput[Touch Input]
        GamepadInput[Gamepad Input]
    end

    subgraph "Rendering System"
        SpriteRenderer[Sprite Renderer]
        AnimationRenderer[Animation Renderer]
        ParticleRenderer[Particle Renderer]
        UIRenderer[UI Renderer]
    end

    subgraph "Physics System"
        CollisionDetector[Collision Detector]
        SpatialPartitioning[Spatial Partitioning]
        PhysicsSolver[Physics Solver]
        ConstraintSolver[Constraint Solver]
    end

    GameCore --> PlayerSystem
    GameCore --> EntitySystem
    GameCore --> PowerupSystem
    GameCore --> ParticleSystem

    PlayerSystem --> PhysicsCore
    EntitySystem --> PhysicsCore
    PowerupSystem --> PhysicsCore

    PlayerSystem --> RenderCore
    EntitySystem --> RenderCore
    PowerupSystem --> RenderCore
    ParticleSystem --> RenderCore

    KeyboardInput --> GameCore
    MouseInput --> GameCore
    TouchInput --> GameCore
    GamepadInput --> GameCore

    RenderCore --> SpriteRenderer
    RenderCore --> AnimationRenderer
    RenderCore --> ParticleRenderer
    RenderCore --> UIRenderer

    PhysicsCore --> CollisionDetector
    PhysicsCore --> SpatialPartitioning
    PhysicsCore --> PhysicsSolver
    PhysicsCore --> ConstraintSolver
```

These UML diagrams provide a comprehensive view of the Bumper Vehicles system architecture, helping developers understand the relationships between components, data flow, and system interactions.
