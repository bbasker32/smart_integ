# Script de Téléchargement S3 pour SmartHire

Ce script permet de télécharger les CVs stockés sur AWS S3 vers votre machine locale.

## Installation

1. **Installer les dépendances Python :**
   ```bash
   pip install -r requirements_s3.txt
   ```

2. **Configurer les variables d'environnement :**
   Créez un fichier `.env` à la racine du projet avec les informations suivantes :
   ```
   AWS_REGION=YOUR_AWS_REGION_HERE
   AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID_HERE
   AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY_HERE
   BUCKET_NAME=nom-de-votre-bucket
   ```

## Utilisation

### 1. Télécharger un fichier spécifique
```python
from downloadFromS3Local import download_from_s3_to_local

# Télécharger un CV spécifique
success = download_from_s3_to_local('cvs/moncv.pdf', 'downloads/moncv.pdf')
if success:
    print("Téléchargement réussi !")
```

### 2. Lister tous les fichiers CV dans S3
```python
from downloadFromS3Local import list_s3_files

# Lister tous les CVs
cv_files = list_s3_files('cvs/')
print(f"Fichiers trouvés : {cv_files}")
```

### 3. Télécharger tous les CVs
```python
from downloadFromS3Local import download_all_cvs_to_local

# Télécharger tous les CVs dans le dossier 'downloads'
download_all_cvs_to_local('downloads')
```

### 4. Exécuter le script directement
```bash
python downloadFromS3Local.py
```
Cela téléchargera automatiquement tous les CVs dans le dossier `downloads`.

## Fonctions disponibles

- `download_from_s3_to_local(s3_key, local_path)` : Télécharge un fichier spécifique
- `list_s3_files(prefix='cvs/')` : Liste tous les fichiers dans un préfixe S3
- `download_all_cvs_to_local(local_download_dir='downloads')` : Télécharge tous les CVs

## Structure des fichiers

Le script s'attend à ce que les CVs soient stockés dans S3 avec le préfixe `cvs/`. Les fichiers seront téléchargés dans le dossier local spécifié (par défaut `downloads/`).

## Gestion des erreurs

Le script inclut une gestion d'erreurs complète avec logging. Les erreurs courantes :
- Variables d'environnement manquantes
- Problèmes de connexion AWS
- Fichiers inexistants dans S3
- Problèmes de permissions locales

## Logs

Le script affiche des logs informatifs pour suivre le processus de téléchargement :
- ✅ Succès de téléchargement
- ❌ Erreurs de téléchargement
- 📊 Statistiques (nombre de fichiers trouvés, etc.) 