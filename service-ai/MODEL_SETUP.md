# Model Setup Instructions

This guide explains how to download and install the Mistral-7B model for use in this project.

## 1. Create the `models` directory

In the `service-ai` folder, create a directory named `models` if it does not already exist:

```bash
mkdir -p service-ai/models
```

## 2. Download the Mistral-7B Model from HuggingFace

You need to download the file:

- **mistral-7b-instruct-v0.1.Q2_K.gguf**

from HuggingFace. You can find it here:

[https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF)

> **Note:** You may need a HuggingFace account to download the model.

### Download via browser
1. Go to the [model page](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF).
2. Download the file named `mistral-7b-instruct-v0.1.Q2_K.gguf`.
3. Move the downloaded file into the `service-ai/models/` directory.

### Download via command line (if you have `huggingface_hub` installed)
```bash
pip install huggingface_hub
cd service-ai/models
huggingface-cli download TheBloke/Mistral-7B-Instruct-v0.1-GGUF mistral-7b-instruct-v0.1.Q2_K.gguf
```

## 3. Final structure

After downloading, you should have:

```
service-ai/
  models/
    mistral-7b-instruct-v0.1.Q2_K.gguf
```

## 4. Ready to use

The backend will automatically use this model file if it is present in the `models` directory.

---
**If you have any issues, check the README or contact the project maintainer.** 