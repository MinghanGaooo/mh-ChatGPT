const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const path = require('path');
const app = express();
const port = 3000;

// Your Google Cloud credentials
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials/mh-chatgpt-ca71a761592e.json', // Path to the JSON file you downloaded from Google Cloud
    scopes: ['https://www.googleapis.com/auth/documents'],
});

const docs = google.docs({ version: 'v1', auth });
const documentId = '1v0n4n1ultuWtARLeJzpFMQJjzc09FhfPFtukD6DwOcU';

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public'));

// Simple route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to your chat application!');
});

app.get('/chat', (req, res) => {
    // Serve your chat application HTML file here
    res.sendFile(path.join(__dirname,'index.html'));
});

app.post('/getChatResponse', async (req, res) => {
    console.log('Received message from client:', req.body.message);
    const userMessage = req.body.message;

    // Make OpenAI API call
    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: userMessage },
        ],
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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',
        },
    });

    const chatResponse = openaiResponse.data.choices[0].message.content;

    // Append the conversation to the Google Doc
    appendToDocument(`User: ${userMessage}\nAssistant: ${chatResponse}`);

    res.json({ response: chatResponse });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

async function appendToDocument(content) {
    try {
        const response = await docs.documents.batchUpdate({
            documentId,
            requestBody: {
                requests: [
                    {
                        insertText: {
                            location: {
                                index: 1, // You may need to adjust the index based on your requirements
                            },
                            text: content + '\n',
                        },
                    },
                ],
            },
        });

        console.log('Appended to document:', response.data);
    } catch (error) {
        console.error('Error appending to document:', error);
    }
}