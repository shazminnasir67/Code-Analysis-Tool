document.addEventListener("DOMContentLoaded", function () {

    const MAX_MESSAGE_LENGTH = 27000; // Set maximum message length

    function handleFileSelection() {
        const fileInput = document.getElementById("input-file");
        const fileDisplay = document.getElementById("file-display");
        const fileNameElement = document.getElementById("file-name");

        if (fileInput.files && fileInput.files[0]) {
            const fileName = fileInput.files[0].name;
            fileNameElement.textContent = fileName;
            fileDisplay.style.display = "inline-block";
            fileDisplay.style.maxHeight = "60px"; // Set max height for file display
            const chatContainer = document.getElementById("chat-container");
            chatContainer.style.paddingBottom = "20px";
        }
    }
    const fileUploadInput = document.querySelector('.file-upload input');
    const fileDisplay = document.querySelector('.file-display');

    fileUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileName = document.querySelector('.file-name');
            fileName.textContent = file.name;
            fileDisplay.style.maxHeight = '60px';
            fileDisplay.style.opacity = '1';
        }
    });

    function removeFile() {
        const fileInput = document.getElementById("input-file");
        const fileDisplay = document.getElementById("file-display");
        const fileNameElement = document.getElementById("file-name");

        fileInput.value = "";
        fileNameElement.textContent = "";
        fileDisplay.style.display = "none";
        const chatContainer = document.getElementById("chat-container");
        chatContainer.style.paddingBottom = "10px";
    }

    function handleInputFocus() {
        const h1Element = document.querySelector(".messages-container h1");
        const pElement = document.querySelector(".messages-container p");
        const featureBoxes = document.querySelectorAll(".feature-box");
        const strokeBoxes = document.querySelectorAll(".stroke");

        if (h1Element) h1Element.style.display = "none";
        if (pElement) pElement.style.display = "none"; // Hide the paragraph

        featureBoxes.forEach(box => box.style.display = "none"); // Hide feature boxes
        strokeBoxes.forEach(box => box.style.display = "none");
        const messagesContainer = document.getElementById("messages");
        const existingAIMessage = document.querySelector(".ai-message");

        if (!existingAIMessage) {
            const message = document.createElement("div");
            message.textContent = "How can I help you today?";
            message.classList.add("message", "ai-message");
            messagesContainer.appendChild(message);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    window.handleFileSelection = handleFileSelection;
    window.removeFile = removeFile;
    window.handleInputFocus = handleInputFocus;





    function sendMessage() {
        const inputField = document.getElementById("chat-input");
        const userMessage = inputField.value.trim();

        if (userMessage === "") {
            alert("Message cannot be empty.");
            return;
        }

        const MAX_MESSAGE_LENGTH = 27000;
        if (userMessage.length > MAX_MESSAGE_LENGTH) {
            alert(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }

        const messagesContainer = document.getElementById("messages");
        const newMessage = document.createElement("div");
        newMessage.classList.add("message", "user-message");
        newMessage.textContent = userMessage;
        messagesContainer.appendChild(newMessage);
        inputField.value = "";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // **User's Language Detection Logic**
        const langMatch = userMessage.match(/\b(java|cobol|swift|matlab|r|dart|csv|django|docker|git|php|xquery|yaml|xml|neon|n4js|mongodb|typescript|kotlin|scala|ruby|julia|rust|react jsx|asp.net|qml|arduino|powershell|powerquery|gradle|graphql|python|javascript|c\+\+|c|c#|sql|go|css)\b/i);
        const language = langMatch ? langMatch[1].toLowerCase() : '';  // Extract and convert to lowercase

        // Send the message to the FastAPI backend
        const payload = {
            messages: [{ role: "user", content: userMessage }],
            temperature: 0.7,
            language: language  // Pass the detected language to the backend
        };

        fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                const aiMessage = document.createElement("div");
                aiMessage.classList.add("message", "ai-message");

                let formattedMessage = data.message;

                // Convert markdown to HTML
                formattedMessage = formattedMessage.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                console.log("After bold formatting:", formattedMessage); // Log for debugging

                // Headings (e.g., ## Heading and ### Subheading)
                formattedMessage = formattedMessage.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
                formattedMessage = formattedMessage.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

                // Bullet lists (e.g., * Item)
                formattedMessage = formattedMessage.replace(/^\* (.*?)$/gm, "<li>$1</li>");
                // Wrap all <li> items in a <ul>
                formattedMessage = formattedMessage.replace(/(<li>.*?<\/li>)/g, "<ul>$1</ul>");

                // Numbered lists (e.g., 1. Item)
                formattedMessage = formattedMessage.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");
                // Wrap all <li> items in a <ol>
                formattedMessage = formattedMessage.replace(/(<li>.*?<\/li>)/g, "<ol>$1</ol>");

                // Line breaks
                formattedMessage = formattedMessage.replace(/\n/g, "<br>");

                // Debug log to see the formatted message
                console.log("Formatted message ready for appending:", formattedMessage);



                const codeBlockRegex = /```([\s\S]*?)```/g;
                let match;
                let lastIndex = 0;

                while ((match = codeBlockRegex.exec(data.message)) !== null) {
                    const codeContent = match[1].trim();  // Extract code content

                    // Get the text before the code block and append it
                    const textBeforeCode = data.message.substring(lastIndex, match.index);
                    if (textBeforeCode) {
                        const explanationContainer = document.createElement("div");
                        explanationContainer.innerHTML = textBeforeCode.replace(/\n/g, "<br>");
                        aiMessage.appendChild(explanationContainer);
                    }

                    // Create and append the code block with the detected language
                    const codeBlock = document.createElement("pre");
                    const codeElement = document.createElement("code");
                    codeElement.className = `language-${language || 'plaintext'}`;  // Use detected language or 'plaintext'
                    codeElement.textContent = codeContent;

                    codeBlock.appendChild(codeElement);
                    aiMessage.appendChild(codeBlock);
                    Prism.highlightElement(codeElement);

                    lastIndex = codeBlockRegex.lastIndex;
                }

                // Append any remaining text after the last code block
                const textAfterCode = data.message.substring(lastIndex);
                if (textAfterCode) {
                    const explanationContainer = document.createElement("div");
                    explanationContainer.innerHTML = textAfterCode.replace(/\n/g, "<br>");
                    aiMessage.appendChild(explanationContainer);
                }
                // aiMessage.innerHTML = formattedMessage;
                messagesContainer.appendChild(aiMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error);
                const errorMessage = document.createElement("div");
                errorMessage.classList.add("message", "error-message");
                errorMessage.textContent = "There was an error processing your request.";
                messagesContainer.appendChild(errorMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            });
    }

    document.getElementById("chat-input").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });



});



