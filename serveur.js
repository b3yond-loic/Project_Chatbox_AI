

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const google_search = require('./google_search'); // Assurez-vous que le fichier google_search.js existe

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Remplacez par votre clé API
const genAI = new GoogleGenerativeAI('API_KEY');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:*****/chat_db') 
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Schéma de message pour MongoDB
const messageSchema = new mongoose.Schema({
    userId: String,
    text: String,
    sender: String,
    timestamp: { type: Date, default: Date.now },
    hasImage: { type: Boolean, default: false },
    hasVideo: { type: Boolean, default: false }
});

const Message = mongoose.model('Message', messageSchema);

// Définition du prompt système pour l'IA
const systemPrompt = "PROMPT_DE_VOTRE_CHOIX, Si une information te manque, tu peux lancer une recherche web pour me donner une réponse précise et à jour. Sois concise et directe.";

// Route pour récupérer l'historique des conversations
app.get('/history', async (req, res) => {
    try {
        const userId = 'utilisateur-tauri'; 
        const messages = await Message.find({ userId }).sort('timestamp');
        res.status(200).json(messages);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'historique." });
    }
});

// Route pour gérer la conversation multimodale et la sauvegarde
app.post('/save', async (req, res) => {
    try {
        const { userId, text, image, video } = req.body;
        
        // Vérifier si c'est la première fois que l'utilisateur envoie un message
        const isFirstMessage = (await Message.countDocuments({ userId })) === 0;

        const userMessage = new Message({
            userId,
            text,
            sender: 'user',
            hasImage: !!image,
            hasVideo: !!video
        });
        await userMessage.save();
        
        let promptParts = [];

        // Ajouter le systemPrompt uniquement pour le premier message
        if (isFirstMessage) {
            promptParts.push({ text: systemPrompt });
        }
        
        promptParts.push({ text: text });

        // Détection des requêtes nécessitant une recherche en ligne
        const searchKeywords = ["google moi", "cours de l'action", "prix de l'action", "valeur de l'action", "dernières infos", "nouvelles technologies", "science"];
        if (searchKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
            try {
                const searchText = text.toLowerCase().replace("google moi", "").trim();
                const searchResults = await google_search.search(searchText || "actualités");
                promptParts.push({ text: `Voici des informations pertinentes extraites du web: ${JSON.stringify(searchResults)}` });
            } catch (searchError) {
                console.error("Erreur lors de la recherche en ligne:", searchError);
            }
        }

        if (image) {
            promptParts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: image,
                },
            });
        }

        if (video) {
            // Logique pour gérer la vidéo ici
        }
        
        const result = await model.generateContent({ contents: [{ role: "user", parts: promptParts }] });
        const response = await result.response;
        const botResponseText = response.text();

        console.log(`Réponse de Gemini: ${botResponseText}`);
        
        const aiMessage = new Message({
            userId,
            text: botResponseText,
            sender: 'ai',
            hasImage: false,
            hasVideo: false
        });
        await aiMessage.save();

        res.status(201).json({ message: botResponseText });
    } catch (error) {
        console.error('Erreur du serveur:', error);
        res.status(500).json({ message: "Erreur lors de la communication avec l'IA." });
    }
});

app.listen(port, () => {
    console.log(`Le serveur API est en cours d'exécution sur le port ${port}`);
});
