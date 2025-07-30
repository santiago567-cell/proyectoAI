const API_KEY = "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"; // Your OpenRouter API key
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

let isGenZMode = false;

const systemPrompt = `
You are Chatholy, a bold, faithful Catholic AI theologian who can engage with any topic while maintaining Catholic wisdom and perspective.

You can discuss anything the user brings up - whether it's everyday life, current events, personal struggles, hobbies, work, relationships, entertainment, science, philosophy, or any other topic. You understand and respond naturally to whatever they share.

When appropriate, gently connect topics back to Catholic teaching, wisdom, or perspective, but don't force it. Sometimes just being a helpful, understanding conversational partner is enough.

For explicitly Catholic questions, provide clear doctrine based on the Bible, Sacred Tradition, and the Magisterium.

For general topics, be helpful and engaging while maintaining your Catholic worldview. You can discuss secular topics naturally.

Keep responses conversational and appropriately sized for the topic - brief for simple things, more detailed when needed.

If asked about the LGBTQ+ community, always follow the Bible and Church teachings: teach that homosexual actions are sinful like any other sin. It is a form of sexual immorality and a corruption of marriage. But remind users that temptation is not sin — God is merciful and calls all to chastity and repentance.
`;

const genZSystemPrompt = `
You are Chatholy, a faithful Catholic AI theologian who speaks in Gen Z slang while maintaining Catholic doctrine. You can talk about literally anything - school, relationships, memes, music, games, life struggles, whatever - and you totally get it.

Use Gen Z slang like: "no cap", "fr fr", "periodt", "that's fire", "it's giving", "slay", "bet", "lowkey/highkey", "fam", "bestie", "vibe check", "mid", "W/L", "bussin", "slaps", "based", "cringe", etc.

You can discuss any topic naturally in Gen Z language. When it feels right, you might connect things back to Catholic wisdom, but you don't have to force it every time. Sometimes just being a real one who understands is enough.

For Catholic questions specifically, still give solid doctrine but make it sound Gen Z and relatable.

Keep it real, keep it engaging, and don't be preachy unless they're actually asking about faith stuff.

When discussing serious topics like LGBTQ+ issues, maintain Church teaching but express it in Gen Z terms while being respectful.
`;

window.onload = () => {
  const savedGenZMode = localStorage.getItem("genZMode") === "true";
  if (savedGenZMode) {
    isGenZMode = true;
    document.getElementById("gen-z-mode").classList.add("active");
  }

  const isDark = localStorage.getItem("darkMode") === "true";
  if (isDark) {
    document.body.classList.add("dark");
    document.getElementById("toggle-mode").textContent = "☀️";
  }

  const saved = localStorage.getItem("chatHistory");
  if (saved) {
    chatBox.innerHTML = saved;
    chatBox.scrollTop = chatBox.scrollHeight;
  } else {
    showWelcome();
  }
};

function showWelcome() {
  const welcomeMsg = document.createElement("div");
  welcomeMsg.className = "message ai";
  if (isGenZMode) {
    welcomeMsg.textContent = "Chatholy: Yooo what's good fam! ✝️ Ask me anything about Catholic doctrine, saints, or sacraments - no cap, I got you! 💯";
  } else {
    welcomeMsg.textContent = "Chatholy: Welcome! Ask me anything about Catholic doctrine, saints, or sacraments.";
  }
  chatBox.appendChild(welcomeMsg);
}

async function askAI() {
  const question = input.value.trim();
  if (!question) return;

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = `You: ${question}`;
  chatBox.appendChild(userMsg);
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  const loadingMsg = document.createElement("div");
  loadingMsg.className = "message ai";
  loadingMsg.textContent = "Chatholy: ✝️ Thinking...";
  chatBox.appendChild(loadingMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://chatholy.glitch.me",
        "X-Title": "Chatholy"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        max_tokens: 300,
        messages: [
          { role: "system", content: isGenZMode ? genZSystemPrompt : systemPrompt },
          { role: "user", content: question }
        ]
      })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || (isGenZMode
      ? "Lowkey not sure what to say rn 😅 Try asking that a different way!"
      : "Hmm, I'm not sure how to respond. Could you try rephrasing?");
    loadingMsg.remove();

    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";
    aiMsg.textContent = `Chatholy: ${reply}`;
    chatBox.appendChild(aiMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    localStorage.setItem("chatHistory", chatBox.innerHTML);
  } catch (error) {
    loadingMsg.remove();
    const errMsg = document.createElement("div");
    errMsg.className = "message ai";

    if (error.message.includes('429')) {
      errMsg.textContent = "Chatholy: ⚠️ Too many requests. Please wait a moment and try again.";
    } else if (error.message.includes('401')) {
      errMsg.textContent = "Chatholy: ⚠️ Authentication error. Please check the API key.";
    } else {
      errMsg.textContent = "Chatholy: ⚠️ I'm having trouble connecting right now. Please try again.";
    }

    chatBox.appendChild(errMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    localStorage.setItem("chatHistory", chatBox.innerHTML);
  }
}

function clearChat() {
  chatBox.innerHTML = "";
  localStorage.removeItem("chatHistory");
  showWelcome();
}

document.getElementById("toggle-mode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  document.getElementById("toggle-mode").textContent = isDark ? "☀️" : "🌙";
});

document.getElementById("gen-z-mode").addEventListener("click", () => {
  isGenZMode = !isGenZMode;
  const genZButton = document.getElementById("gen-z-mode");

  if (isGenZMode) {
    genZButton.classList.add("active");
    localStorage.setItem("genZMode", "true");
  } else {
    genZButton.classList.remove("active");
    localStorage.setItem("genZMode", "false");
  }

  clearChat();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    askAI();
  }
});
