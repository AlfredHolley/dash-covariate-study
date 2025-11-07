# Guide de déploiement sur VPS

## 📋 Prérequis sur le VPS

```bash
# Se connecter au VPS
ssh votre_utilisateur@votre_ip

# Installer Docker et Docker Compose (si pas déjà installé)
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER  # Pour éviter sudo à chaque fois
# Déconnexion/reconnexion nécessaire après usermod
```

## 🚀 Méthode 1 : Transfert manuel (SCP)

### Étape 1 : Préparer les fichiers localement

Sur votre machine locale, dans le dossier du projet :

```bash
# Créer une archive (optionnel, plus rapide)
tar -czf dash-app.tar.gz \
  app.py \
  requirements.txt \
  Dockerfile \
  docker-compose.yml \
  assets/ \
  dash_dataset_wide.csv \
  article_tables.xlsx \
  .dockerignore
```

### Étape 2 : Transférer vers le VPS

```bash
# Via SCP
scp dash-app.tar.gz votre_utilisateur@votre_ip:/home/votre_utilisateur/

# Ou transférer le dossier complet
scp -r . votre_utilisateur@votre_ip:/home/votre_utilisateur/dash-app/
```

### Étape 3 : Sur le VPS

```bash
# Se connecter
ssh votre_utilisateur@votre_ip

# Aller dans le dossier
cd ~/dash-app  # ou ~/ si vous avez décompressé

# Construire et démarrer
docker compose build --no-cache
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

## 🔄 Méthode 2 : Git (Recommandé)

### Étape 1 : Créer un dépôt (si pas déjà fait)

```bash
# Sur GitHub/GitLab, créer un dépôt privé
# Puis localement :
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre_user/votre_repo.git
git push -u origin main
```

### Étape 2 : Sur le VPS

```bash
# Installer Git si nécessaire
sudo apt install -y git

# Cloner le dépôt
cd ~
git clone https://github.com/votre_user/votre_repo.git dash-app
cd dash-app

# Build et démarrage
docker compose build --no-cache
docker compose up -d
```

### Pour mettre à jour plus tard :

```bash
# Sur le VPS
cd ~/dash-app
git pull
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🌐 Méthode 3 : Avec Reverse Proxy (Nginx)

### Configuration Nginx

```bash
# Sur le VPS, installer Nginx
sudo apt install -y nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/dash-app
```

Contenu de `/etc/nginx/sites-available/dash-app` :

```nginx
server {
    listen 80;
    server_name votre_domaine.com;  # Ou votre IP

    # Augmenter la limite de taille des requêtes pour éviter l'erreur 413
    client_max_body_size 50M;
    client_body_buffer_size 50M;

    location / {
        proxy_pass http://localhost:8050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts pour éviter les coupures
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        
        # Augmenter les buffers pour les grandes requêtes
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
```

Activer le site :

```bash
sudo ln -s /etc/nginx/sites-available/dash-app /etc/nginx/sites-enabled/
sudo nginx -t  # Vérifier la config
sudo systemctl restart nginx
```

### SSL avec Let's Encrypt (optionnel)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre_domaine.com
```

## 📝 Modifier docker-compose.yml pour production

Créer `docker-compose.prod.yml` :

```yaml
services:
  dash-app:
    build: .
    ports:
      - "127.0.0.1:8050:8050"  # Écoute uniquement en localhost
    container_name: dash-buchinger-app
    restart: unless-stopped
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      # Optionnel : pour persister les logs
      - ./logs:/app/logs
```

Puis utiliser :
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔒 Sécurité

### Firewall (UFW)

```bash
sudo apt install -y ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Variables d'environnement sensibles

Créer `.env` sur le VPS :

```bash
# .env (ne pas committer)
DEBUG=False
SECRET_KEY=votre_secret_key_ici
```

Et modifier `docker-compose.yml` :

```yaml
services:
  dash-app:
    # ...
    env_file:
      - .env
```

## 📊 Vérification et logs

```bash
# Vérifier que le conteneur tourne
docker control ls

# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs dash-app

# Entrer dans le conteneur (debug)
docker compose exec dash-app bash
```

## 🔄 Script de déploiement automatisé

Utiliser le script `deploy.sh` fourni :

```bash
# Rendre exécutable
chmod +x deploy.sh

# Modifier les variables en haut du script
# Puis exécuter
./deploy.sh
```

## ⚠️ Résolution de problèmes

### L'app ne démarre pas

```bash
# Vérifier les logs
docker compose logs dash-app

# Vérifier les ports
sudo netstat -tlnp | grep 8050

# Rebuild complet
docker compose down
docker compose build --no-cache --pull
docker compose up -d
```

### Problèmes de permissions

```bash
# Donner les permissions au dossier
sudo chown -R $USER:$USER ~/dash-app
chmod -R 755 ~/dash-app
```

### Fichiers manquants

Vérifier que tous les fichiers nécessaires sont présents :
- `app.py`
- `requirements.txt`
- `Dockerfile`
- `docker-compose.yml`
- `assets/` (tout le dossier)
- `dash_dataset_wide.csv`
- `article_tables.xlsx`

