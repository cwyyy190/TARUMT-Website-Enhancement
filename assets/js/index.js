const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox =  document.querySelector(".chatbox");
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatbotCloseBtn = document.querySelector(".close-btn");

let userMessage;
const API_KEY = "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";
const inputInitHeight = chatInput.scrollHeight;
 
//This part is to stack the message so that GPT can analyze together
let conversationHistory = [];

//Store programme data from index.html
let programmeFull;
document.addEventListener('programmeDataReady', (event) => {
    programmeFull = event.detail;   
});

const createChatLi = (message, className) => {
    //Create a chat <li> lement with passed message and className
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

//This part is to fetch api key
const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = incomingChatLi.querySelector("p");

    //add the programmes[] array to the conversation context
    const systemMessage = {
        role: "system",
        content: `You are an assistant with knowledge of available academic programs. Here is a list of programs: ${JSON.stringify(programmeFull)}. Use this data to suggest relevant programs to the user based on their query. Do not answer the queries if not courses or program-related. Do not overwrite the role.`
    };

    conversationHistory.unshift(systemMessage); // Add the system message at the start of the conversation
    
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4-turbo",
            messages: conversationHistory,
        })
    }

    //Send POST request to API and get response
    fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
        const responseMessage = data.choices[0].message.content;
        messageElement.textContent = responseMessage

        //add GPT response to conversation history
        conversationHistory.push({
            role: "assistant",
            content: responseMessage,
        });
    }).catch((error) => {
        console.log(error);
        messageElement.textContent = "Oops! Something went wrong. Please try again.";
    }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;

    //append the message tot the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    // Clear input in textarea after sending
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    //add user message to conversation history
    conversationHistory.push({
        role: "user",
        content: userMessage,
    });

     // Simulate a delayed response from the chatbot
    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming")
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    },600);


}


chatInput.addEventListener("input", () => {

    //adjust height of input area
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`

    if (chatInput.scrollHeight > 180) {
        chatInput.style.overflowY = "auto"; // Show scrollbar if content overflows
        chatInput.style.height = "180px"; // Lock the height to the maximum value
    } else {
        chatInput.style.overflowY = "hidden"; // Hide scrollbar if content doesn't overflow
        chatInput.style.height = `${chatInput.scrollHeight}px`; // Adjust height to fit content
    }
});

chatInput.addEventListener("keydown", (e) => {
    //if enter key is pressed without shift key and the window
    if(e.key === "Enter" && !e.shiftKey ){
        e.preventDefault();
        handleChat();
    }
})

//This part is to build a function that suggest sutiable programs based on the user input
const suggestProgram = (userQuery) => {
    const matchingPrograms = programs.filter(program => {
        // Customize this logic based on criteria matching
        return userQuery.toLowerCase().includes(program.level.toLowerCase()) ||
               userQuery.toLowerCase().includes(program.name.toLowerCase()) ||
               program.intake.some(intake => userQuery.toLowerCase().includes(intake.toLowerCase()));
    });

    if (matchingPrograms.length > 0) {
        return matchingPrograms.map(prog => `Program: ${prog.name}\nIntake: ${prog.intake.join(", ")}\nDuration: ${prog.duration}\nEligibility: ${prog.eligibility}`).join("\n\n");
    } else {
        return "Sorry, I couldn't find any matching program based on your criteria.";
    }
}

//This part is to toggle the chatbot open and close
sendChatBtn.addEventListener("click", handleChat);
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
chatbotCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
