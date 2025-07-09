# Instructions d'installation du modèle

Ce guide explique comment télécharger et installer le modèle Mistral-7B pour l'utiliser dans ce projet.

## 1. Créer le dossier `models`

Dans le dossier `service-ai`, créez un dossier nommé `models` s'il n'existe pas déjà :

```bash
mkdir -p service-ai/models
```

## 2. Télécharger le modèle Mistral-7B depuis HuggingFace

Vous devez télécharger le fichier :

- **mistral-7b-instruct-v0.1.Q2_K.gguf**

Depuis HuggingFace. Vous pouvez le trouver ici :

[https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF)

> **Remarque :** Vous aurez peut-être besoin d'un compte HuggingFace pour télécharger le modèle.

### Téléchargement via le navigateur
1. Rendez-vous sur la [page du modèle](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF).
2. Téléchargez le fichier nommé `mistral-7b-instruct-v0.1.Q2_K.gguf`.
3. Déplacez le fichier téléchargé dans le dossier `service-ai/models/`.

### Téléchargement en ligne de commande (si vous avez `huggingface_hub` installé)
```bash
pip install huggingface_hub
cd service-ai/models
huggingface-cli download TheBloke/Mistral-7B-Instruct-v0.1-GGUF mistral-7b-instruct-v0.1.Q2_K.gguf
```

## 3. Structure finale attendue

Après le téléchargement, vous devez avoir :

```
service-ai/
  models/
    mistral-7b-instruct-v0.1.Q2_K.gguf
```

## 4. Prêt à l'emploi

Le backend utilisera automatiquement ce fichier modèle s'il est présent dans le dossier `models`.

---
**En cas de problème, consultez le README ou contactez le mainteneur du projet.** 