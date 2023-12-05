function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    
    // Display user message in the chat
    displayMessage('You', userInput);

    // Clear the user input field
    document.getElementById('user-input').value = '';

    // Send user message to the server
    sendToServer(userInput);
}

function displayMessage(sender, message) {
    const chatContainer = document.getElementById('chat');
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatContainer.appendChild(messageElement);

    // Scroll to the bottom of the chat container to show the latest messages
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendToServer(message) {
    try {
        const response = await fetch('/getChatResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Failed to get chat response from the server.');
        }

        const responseBody = await response.json();

        // Display the assistant's response in the chat
        displayMessage('Assistant', responseBody.response);
    } catch (error) {
        console.error('Error sending message to the server:', error);
    }
}