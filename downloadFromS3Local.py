import os
import boto3
from botocore.exceptions import ClientError
import logging
from pathlib import Path
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration du client S3
s3_client = boto3.client(
    's3',
    region_name=os.getenv('AWS_REGION'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

def download_from_s3_to_local(s3_key, local_path):
    """
    Fonction utilitaire pour télécharger un fichier S3 en local
    
    Args:
        s3_key (str): Clé du fichier dans S3 (ex: 'cvs/moncv.pdf')
        local_path (str): Chemin local où sauvegarder le fichier
    
    Returns:
        bool: True si succès, False sinon
    """
    try:
        # Créer le dossier parent si nécessaire
        local_dir = Path(local_path).parent
        local_dir.mkdir(parents=True, exist_ok=True)
        
        # Télécharger le fichier depuis S3
        bucket_name = os.getenv('BUCKET_NAME')
        if not bucket_name:
            logger.error("BUCKET_NAME non défini dans les variables d'environnement")
            return False
            
        s3_client.download_file(bucket_name, s3_key, local_path)
        
        logger.info(f'Fichier téléchargé avec succès : {local_path}')
        return True
        
    except ClientError as e:
        logger.error(f'Erreur lors du téléchargement S3 : {e}')
        return False
    except Exception as e:
        logger.error(f'Erreur inattendue : {e}')
        return False

def list_s3_files(prefix='cvs/'):
    """
    Lister tous les fichiers dans un préfixe S3
    
    Args:
        prefix (str): Préfixe pour filtrer les fichiers (défaut: 'cvs/')
    
    Returns:
        list: Liste des clés S3
    """
    try:
        bucket_name = os.getenv('BUCKET_NAME')
        if not bucket_name:
            logger.error("BUCKET_NAME non défini dans les variables d'environnement")
            return []
            
        response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix=prefix)
        
        if 'Contents' in response:
            return [obj['Key'] for obj in response['Contents']]
        else:
            return []
            
    except ClientError as e:
        logger.error(f'Erreur lors de la liste des fichiers S3 : {e}')
        return []

def download_all_cvs_to_local(local_download_dir='downloads'):
    """
    Télécharger tous les CVs depuis S3 vers un dossier local
    
    Args:
        local_download_dir (str): Dossier local de destination
    """
    try:
        # Créer le dossier de destination
        download_path = Path(local_download_dir)
        download_path.mkdir(exist_ok=True)
        
        # Lister tous les fichiers CV dans S3
        cv_files = list_s3_files('cvs/')
        
        if not cv_files:
            logger.info("Aucun fichier CV trouvé dans S3")
            return
            
        logger.info(f"Trouvé {len(cv_files)} fichiers CV à télécharger")
        
        # Télécharger chaque fichier
        for s3_key in cv_files:
            filename = Path(s3_key).name
            local_file_path = download_path / filename
            
            if download_from_s3_to_local(s3_key, str(local_file_path)):
                logger.info(f"✓ {filename} téléchargé")
            else:
                logger.error(f"✗ Échec du téléchargement de {filename}")
                
    except Exception as e:
        logger.error(f'Erreur lors du téléchargement en lot : {e}')

# Exemple d'utilisation
if __name__ == "__main__":
    # Exemple 1: Télécharger un fichier spécifique
    # success = download_from_s3_to_local('cvs/moncv.pdf', 'downloads/moncv.pdf')
    
    # Exemple 2: Télécharger tous les CVs
    download_all_cvs_to_local() 