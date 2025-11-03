# 🔧 Configuration GitHub Actions pour déploiement automatique

Ce guide vous explique comment configurer le déploiement automatique sur votre VPS via GitHub Actions.

## 📋 Prérequis

1. **Accès SSH à votre VPS** avec une clé SSH
2. **Git installé sur le VPS**
3. **Docker et Docker Compose installés sur le VPS**
4. **Le dépôt Git cloné sur le VPS** dans un répertoire accessible

## 🔐 Configuration des secrets GitHub

### Étape 1 : Accéder aux paramètres du dépôt

1. Allez sur votre dépôt GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** > **Actions**
4. Cliquez sur **New repository secret**

### Étape 2 : Ajouter les secrets requis

Vous devez créer **4 secrets** :

#### 1. `SSH_HOST`
- **Nom** : `SSH_HOST`
- **Valeur** : L'adresse IP ou le nom de domaine de votre VPS
  - Exemple : `123.45.67.89` ou `vps.example.com`

#### 2. `SSH_USER`
- **Nom** : `SSH_USER`
- **Valeur** : Le nom d'utilisateur SSH pour se connecter au VPS
  - Exemple : `ubuntu`, `root`, `deploy`, etc.

#### 3. `SSH_KEY`
- **Nom** : `SSH_KEY`
- **Valeur** : Le contenu complet de votre **clé privée SSH**

Pour générer/récupérer votre clé SSH :

```bash
# Si vous n'avez pas de clé, générez-en une :
ssh-keygen -t ed25519 -C "github-actions-deploy"

# Afficher la clé privée (sur votre machine locale)
cat ~/.ssh/id_ed25519

# Copiez TOUT le contenu, y compris les lignes :
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... (tout le contenu) ...
# -----END OPENSSH PRIVATE KEY-----

# Sur le VPS, ajoutez la clé publique au fichier authorized_keys :
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

⚠️ **IMPORTANT** : Copiez la **clé privée** complète dans le secret `SSH_KEY`.

#### 4. `SSH_PORT` (optionnel, par défaut 22)
- **Nom** : `SSH_PORT`
- **Valeur** : Le port SSH de votre VPS
  - Par défaut : `22`
  - Si vous utilisez un port personnalisé : ex. `2222`

## 🏗️ Configuration sur le VPS

### Étape 1 : Cloner le dépôt (si pas déjà fait)

```bash
# Sur le VPS
cd /var/www  # ou ~/
git clone https://github.com/VOTRE_USER/VOTRE_REPO.git dash-app
cd dash-app
```

### Étape 2 : Configurer le réseau Docker (si nécessaire)

Si votre `docker-compose.yml` utilise un réseau externe (`shared-proxy`), créez-le :

```bash
docker network create shared-proxy
```

### Étape 3 : Vérifier les permissions

```bash
# Assurez-vous que l'utilisateur SSH a les permissions nécessaires
sudo chown -R $USER:$USER /var/www/dash-app  # ou ~/dash-app

# Donner les permissions Docker (si nécessaire)
sudo usermod -aG docker $USER
# Puis déconnectez/reconnectez-vous
```

### Étape 4 : Premier déploiement manuel

```bash
cd /var/www/dash-app  # ou ~/dash-app
docker compose build
docker compose up -d
```

## 🚀 Utilisation

### Déploiement automatique

Une fois les secrets configurés, **chaque push sur la branche `main` ou `master`** déclenchera automatiquement le déploiement.

### Déploiement manuel

Vous pouvez aussi déclencher le déploiement manuellement depuis GitHub :

1. Allez dans l'onglet **Actions** de votre dépôt
2. Sélectionnez le workflow **"Déploiement VPS"**
3. Cliquez sur **"Run workflow"**
4. Sélectionnez la branche et cliquez sur **"Run workflow"**

## 🔍 Vérification

Après un déploiement, vous pouvez vérifier :

1. **Dans GitHub Actions** : Consultez les logs du workflow
2. **Sur le VPS** :
   ```bash
   cd /var/www/dash-app  # ou ~/dash-app
   docker compose ps
   docker compose logs -f
   ```

## ⚙️ Personnalisation

### Changer le chemin de déploiement

Modifiez le chemin dans `.github/workflows/deploy.yml` :

```yaml
cd /var/www/dash-app || cd ~/dash-app
```

Remplacez par votre chemin personnalisé :

```yaml
cd /home/deploy/myapp
```

### Déployer uniquement sur une branche spécifique

Modifiez dans `.github/workflows/deploy.yml` :

```yaml
on:
  push:
    branches:
      - main  # Changez ici
```

### Ajouter des étapes de test

Le workflow inclut déjà une étape de test basique. Vous pouvez l'enrichir :

```yaml
- name: 🧪 Tests
  run: |
    pip install -r requirements.txt
    python -m pytest tests/  # Si vous avez des tests
    python -m pylint app.py  # Linting
```

## 🐛 Résolution de problèmes

### Erreur de connexion SSH

- Vérifiez que `SSH_HOST`, `SSH_USER`, `SSH_KEY` sont corrects
- Testez la connexion manuellement : `ssh -i ~/.ssh/id_ed25519 user@host`

### Erreur "Permission denied"

- Vérifiez que la clé publique est dans `~/.ssh/authorized_keys` sur le VPS
- Vérifiez les permissions : `chmod 600 ~/.ssh/authorized_keys`

### Erreur "docker: command not found"

- Installez Docker sur le VPS : `sudo apt install docker.io docker-compose`
- Ou utilisez Docker Compose plugin : `sudo apt install docker-compose-plugin`

### Le conteneur ne démarre pas

- Vérifiez les logs : `docker compose logs dash-app`
- Vérifiez que tous les fichiers nécessaires sont présents (CSV, Excel, assets, etc.)

### Réseau Docker manquant

Si vous avez l'erreur `network shared-proxy not found` :

```bash
docker network create shared-proxy
```

## 📝 Notes importantes

- ⚠️ Ne commitez **jamais** vos secrets dans le dépôt
- 🔒 Gardez votre clé privée SSH secrète
- 🔄 Le workflow fait un `git pull`, assurez-vous que le VPS est à jour
- 📦 Le rebuild est fait **sans cache** pour garantir la dernière version
- 🛑 Le workflow arrête les conteneurs avant de les reconstruire (petit temps d'arrêt)

