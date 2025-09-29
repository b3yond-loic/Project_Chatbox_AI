

import { invoke } from "@tauri-apps/api/core";

// Éléments de l'interface utilisateur
let chatInputEl: HTMLInputElement | null;
let sendButtonEl: HTMLButtonElement | null;
let messageBoxEl: HTMLElement | null;
let imageUploadEl: HTMLInputElement | null;
let videoUploadEl: HTMLInputElement | null;

// Définir les variables pour le contenu multimédia
let uploadedImage: string | null = null;
let uploadedVideo: string | null = null;

/**
 * Fonction pour ajouter un message à l'interface de chat.
 * @param text Le texte du message à afficher.
 * @param sender 'user' pour l'utilisateur, 'ai' pour l'IA.
 * @param imageContent Le contenu Base64 de l'image, si elle existe.
 */
function addMessage(text: string, sender: 'user' | 'ai', imageContent: string | null = null) {
  if (!messageBoxEl) return;

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  if (imageContent) {
      const imageElement = document.createElement("img");
      imageElement.src = `data:image/jpeg;base64,${imageContent}`;
      imageElement.style.maxWidth = "100%";
      imageElement.style.borderRadius = "10px";
      imageElement.style.marginBottom = "10px";
      messageDiv.appendChild(imageElement);
  }
  
  const textNode = document.createTextNode(text);
  messageDiv.appendChild(textNode);

  if (sender === 'user') {
    messageContainer.classList.add("user-container");
    messageDiv.classList.add("user-message");
  } else {
    messageContainer.classList.add("ai-container");
    messageDiv.classList.add("ai-message");
  }

  messageContainer.appendChild(messageDiv);
  messageBoxEl.appendChild(messageContainer);

  messageBoxEl.scrollTop = messageBoxEl.scrollHeight;
}

/**
 * Fonction pour envoyer des messages à l'API et afficher les réponses.
 */
async function sendMessage() {
  if (!chatInputEl) return;
  const messageText = chatInputEl.value;
  const isMultimodal = uploadedImage !== null || uploadedVideo !== null;

  if (messageText.trim() === '' && !isMultimodal) return;

  addMessage(messageText, 'user', uploadedImage);
  chatInputEl.value = '';

  try {
    const response = await fetch('http://localhost:3000/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'utilisateur-tauri',
        text: messageText,
        image: uploadedImage,
        video: uploadedVideo
      }),
    });

    if (!response.ok) {
        throw new Error(`Erreur du serveur: ${response.status}`);
    }

    const data = await response.json();
    addMessage(data.message, 'ai');

    uploadedImage = null;
    uploadedVideo = null;

  } catch (error) {
    console.error('Erreur de l\'API:', error);
    addMessage("Erreur de connexion au serveur.", 'ai');
  }
}

/**
 * Fonction pour charger l'historique des messages au démarrage.
 */
async function loadHistory() {
    try {
        const response = await fetch('http://localhost:3000/history');
        if (!response.ok) {
            throw new Error(`Erreur du serveur: ${response.status}`);
        }
        const messages = await response.json();

        messages.forEach((msg: any) => {
            // Assure que le champ `image` est passé correctement
            addMessage(msg.text, msg.sender, msg.hasImage ? msg.image : null);
        });

    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        addMessage("Impossible de charger l'historique des conversations.", 'ai');
    }
}

// Fonction pour lire le fichier et le convertir en Base64
function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Événement qui se déclenche lorsque la page est chargée
window.addEventListener("DOMContentLoaded", () => {
    chatInputEl = document.querySelector("#chat-input");
    sendButtonEl = document.querySelector("#send-button");
    messageBoxEl = document.querySelector("#message-box");
    imageUploadEl = document.querySelector("#image-upload");
    videoUploadEl = document.querySelector("#video-upload");

    loadHistory();

    sendButtonEl?.addEventListener("click", sendMessage);
    chatInputEl?.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    imageUploadEl?.addEventListener("change", async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            try {
                const base64String = await readFileAsBase64(file);
                uploadedImage = base64String.split(',')[1];
                chatInputEl!.value = `Image ${file.name} chargée.`;
            } catch (error) {
                console.error("Erreur lors de la lecture de l'image:", error);
                uploadedImage = null;
            }
        }
    });
    
    videoUploadEl?.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            console.log(`Vidéo ${file.name} chargée, prête à être envoyée.`);
            uploadedVideo = "video_placeholder_data"; 
            chatInputEl!.value = `Vidéo ${file.name} chargée.`;
        }
    });
});
