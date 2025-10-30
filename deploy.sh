#!/bin/bash
# Script de déploiement simple pour VPS

# Configuration - À MODIFIER
VPS_USER="votre_utilisateur"
VPS_HOST="votre_ip_ou_domaine"
VPS_PATH="/home/$VPS_USER/dash-app"
LOCAL_PATH="."

echo "📦 Envoi des fichiers vers le VPS..."

# Créer le répertoire sur le VPS
ssh $VPS_USER@$VPS_HOST "mkdir -p $VPS_PATH"

# Envoyer tous les fichiers nécessaires
scp -r $LOCAL_PATH/* $VPS_USER@$VPS_HOST:$VPS_PATH/

echo "✅ Fichiers envoyés !"
echo "🔧 Connexion au VPS pour build et démarrage..."

ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
cd /home/$USER/dash-app

# Arrêter les conteneurs existants
docker compose down

# Rebuild les images
docker compose build --no-cache

# Démarrer les services
docker compose up -d

# Afficher les logs
docker compose logs -f
ENDSSH

echo "🚀 Application déployée !"

