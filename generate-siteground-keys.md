# Generate SSH Keys for Siteground (No Passphrase)

Since Siteground requires a passphrase when creating keys through their interface, we'll generate the keys locally and upload the public key.

## Steps:

### 1. Generate SSH Key Pair Locally (No Passphrase)

**On Windows (PowerShell):**

```powershell
# Navigate to your project directory
cd C:\dev\bumper-vehicles

# Generate key for app.bumpervehicles.com
ssh-keygen -t ed25519 -f .ssh/siteground_app_key -N '""' -C "github-deploy-app"

# Generate key for bumpervehicles.com (landing)
ssh-keygen -t ed25519 -f .ssh/siteground_landing_key -N '""' -C "github-deploy-landing"
```

**On Mac/Linux:**

```bash
# Generate key for app.bumpervehicles.com
ssh-keygen -t ed25519 -f ~/.ssh/siteground_app_key -N '' -C "github-deploy-app"

# Generate key for bumpervehicles.com (landing)
ssh-keygen -t ed25519 -f ~/.ssh/siteground_landing_key -N '' -C "github-deploy-landing"
```

This creates:

- `siteground_app_key` (private key - keep secret!)
- `siteground_app_key.pub` (public key - upload to Siteground)
- `siteground_landing_key` (private key - keep secret!)
- `siteground_landing_key.pub` (public key - upload to Siteground)

### 2. Upload Public Keys to Siteground

#### For app.bumpervehicles.com:

1. Open `siteground_app_key.pub` in a text editor
2. Copy the entire contents (starts with `ssh-ed25519`)
3. In Siteground:
   - Go to Site Tools for `app.bumpervehicles.com`
   - Navigate to **Dev** → **SSH Keys Manager**
   - Click **Add SSH Key** or **Import SSH Key**
   - Paste the public key content
   - Save it
4. Note the SSH username that gets created/assigned

#### For bumpervehicles.com (landing):

1. Open `siteground_landing_key.pub` in a text editor
2. Copy the entire contents
3. In Siteground:
   - Go to Site Tools for `bumpervehicles.com`
   - Navigate to **Dev** → **SSH Keys Manager**
   - Click **Add SSH Key** or **Import SSH Key**
   - Paste the public key content
   - Save it
4. Note the SSH username that gets created/assigned

### 3. Get Private Keys for GitHub Secrets

**For Windows (PowerShell):**

```powershell
# View the private key for app (copy this to GitHub secret)
Get-Content .ssh\siteground_app_key

# View the private key for landing (copy this to GitHub secret)
Get-Content .ssh\siteground_landing_key
```

**For Mac/Linux:**

```bash
# View the private key for app (copy this to GitHub secret)
cat ~/.ssh/siteground_app_key

# View the private key for landing (copy this to GitHub secret)
cat ~/.ssh/siteground_landing_key
```

### 4. Update GitHub Secrets

1. Go to GitHub → Your Repo → **Settings** → **Secrets and variables** → **Actions**

2. Update these secrets with the private keys:
   - **`SITEGROUND_APP_SSH_PRIVATE_KEY`** → Paste the entire contents of `siteground_app_key` (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)
   - **`SITEGROUND_LANDING_SSH_PRIVATE_KEY`** → Paste the entire contents of `siteground_landing_key`

### 5. Security Note

**IMPORTANT:**

- Never commit the private keys (`.ssh/siteground_*_key` files) to Git
- Add them to `.gitignore` if they're in your project directory
- The private keys should ONLY be in:
  1. Your local machine (temporarily)
  2. GitHub Secrets (encrypted)

### 6. Test Locally (Optional)

You can test the connection before deploying:

```powershell
# Test app connection
ssh -i .ssh\siteground_app_key -p 18765 [SSH_USERNAME]@[SSH_HOST]

# Test landing connection
ssh -i .ssh\siteground_landing_key -p 18765 [SSH_USERNAME]@[SSH_HOST]
```

Replace `[SSH_USERNAME]` and `[SSH_HOST]` with the values from Siteground.
