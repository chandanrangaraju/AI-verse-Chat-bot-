const $ = (s) => document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
  // Theme
  const body = document.body;
  if ((localStorage.getItem("theme") || "dark") === "light") body.classList.add("light");
  $("#darkModeToggle")?.addEventListener("click", () => {
    body.classList.toggle("light");
    localStorage.setItem("theme", body.classList.contains("light") ? "light" : "dark");
  });

  // Model popover
  const pop = $("#modelsPopover");
  $("#toggleModelsBtn")?.addEventListener("click", () => {
    const open = pop?.getAttribute("aria-hidden") === "false";
    pop?.setAttribute("aria-hidden", open ? "true" : "false");
  });
  document.addEventListener("click", (e) => {
    if (pop && !pop.contains(e.target) && !e.target.closest("#toggleModelsBtn")) {
      pop.setAttribute("aria-hidden", "true");
    }
  });

  // Active model pill
  const modelSelect = $("#modelSelect");
  const activeModel = $("#activeModel");
  if (modelSelect && activeModel) {
    activeModel.textContent = modelSelect.options[modelSelect.selectedIndex].textContent;
    modelSelect.addEventListener("change", () => {
      activeModel.textContent = modelSelect.options[modelSelect.selectedIndex].textContent;
    });
  }

  // Hook up send (works for button click + Enter)
  const form = $("#composerForm");
  const askBtn = $("#askBtn");
  const input = $("#question");

  const send = (ev) => {
    ev?.preventDefault();
    askAI();
  };

  form?.addEventListener("submit", send);
  askBtn?.addEventListener("click", send);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  });
});

// elements used by askAI
const chatContainer = document.getElementById("chat-container");
const spinner = document.getElementById("loadingSpinner");
const modelSelect = document.getElementById("modelSelect");
const inputEl = document.getElementById("question");

function renderMessage(text, role = "ai") {
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "🧑" : "🤖";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = (window.marked ? marked.parse(text || "") : (text || ""));
  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  chatContainer.appendChild(wrap);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function askAI() {
  const q = (inputEl?.value || "").trim();
  if (!q) return;

  renderMessage(q, "user");
  if (inputEl) inputEl.value = "";
  spinner?.classList.remove("d-none");

  // optimistic placeholder so you SEE the button worked
  const thinking = document.createElement("div");
  thinking.className = "msg ai";
  thinking.innerHTML = `<div class="avatar">🤖</div><div class="bubble">Thinking…</div>`;
  chatContainer.appendChild(thinking);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch("https://ai-verse-chat-bot.onrender.com/api/faq/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelSelect?.value || "openai/gpt-4o-mini",
        question: q
      })
    });

    const data = await res.json().catch(() => ({}));
    const answer = data?.answer || "⚠️ No response received from API.";
    const bubble = thinking.querySelector(".bubble");
    streamText(bubble, answer, 30); // speed = 30ms per char

  } catch (e) {
    console.error("Request failed:", e);
    thinking.querySelector(".bubble").textContent = "⚠️ Unable to reach the server.";
  } finally {
    spinner?.classList.add("d-none");
  }
}
function streamText(element, text, speed = 30) {
  element.innerHTML = ""; // Clear placeholder
  let i = 0;

  function type() {
    if (i < text.length) {
      element.innerHTML += text[i];
      i++;
      element.scrollIntoView({ behavior: "smooth", block: "end" });
      setTimeout(type, speed);
    }
  }

  type();
}
