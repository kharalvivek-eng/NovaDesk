
"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

/* WELCOME SCREEN */
window.addEventListener("load", () => {
  setTimeout(() => {
    $("#welcome")?.classList.add("done");

    $$(".reveal").forEach((element, index) => {
      setTimeout(() => element.classList.add("visible"), Math.min(index * 90, 700));
    });
  }, 2400);
});

$("#current-year").textContent = new Date().getFullYear();

/* SCROLL REVEAL */
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  $$(".reveal").forEach((element) => revealObserver.observe(element));
} else {
  $$(".reveal").forEach((element) => element.classList.add("visible"));
}

/* GOOGLE SEARCH */
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const query = $("#search-input").value.trim();

  if (query) {
    window.open(
      "https://www.google.com/search?q=" + encodeURIComponent(query),
      "_blank",
      "noopener,noreferrer"
    );
  }
});

/* THEME */
const savedTheme = localStorage.getItem("novadesk-theme");

if (savedTheme === "light") {
  document.body.classList.add("light-theme");
}

$("#theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("light-theme");

  const theme = document.body.classList.contains("light-theme") ? "light" : "dark";
  localStorage.setItem("novadesk-theme", theme);
});

/* CLICK RIPPLE AND BLACK-HOLE EFFECT */
document.addEventListener("click", (event) => {
  const effects = $("#effects");
  if (!effects) return;

  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = event.clientX + "px";
  ripple.style.top = event.clientY + "px";
  effects.appendChild(ripple);

  setTimeout(() => ripple.remove(), 900);

  if (event.target.closest("button, a, input, textarea, label")) return;

  const hole = document.createElement("span");
  hole.className = "click-hole";
  hole.style.left = event.clientX + "px";
  hole.style.top = event.clientY + "px";
  effects.appendChild(hole);

  setTimeout(() => hole.remove(), 3100);
});

/* BACKGROUND SPARKLES */
const starContainer = document.createElement("div");
starContainer.className = "background-stars";
starContainer.setAttribute("aria-hidden", "true");

Object.assign(starContainer.style, {
  position: "fixed",
  inset: "0",
  zIndex: "-1",
  pointerEvents: "none",
  overflow: "hidden"
});

for (let i = 0; i < 35; i++) {
  const star = document.createElement("span");

  star.textContent = i % 4 === 0 ? "✦" : "·";

  Object.assign(star.style, {
    position: "absolute",
    left: Math.random() * 100 + "%",
    top: Math.random() * 100 + "%",
    color: i % 2 ? "#a78bfa" : "#5ee7f5",
    opacity: String(0.12 + Math.random() * 0.35),
    fontSize: (7 + Math.random() * 9) + "px",
    animation: `star-drift ${5 + Math.random() * 8}s ease-in-out infinite`,
    animationDelay: -Math.random() * 8 + "s"
  });

  starContainer.appendChild(star);
}

document.body.appendChild(starContainer);

/* NOTES: LOCAL AUTOSAVE */
const noteTitle = $("#note-title");
const notesInput = $("#notes-input");
const notesStatus = $("#notes-status");

function loadNote() {
  try {
    const note = JSON.parse(localStorage.getItem("novadesk-note") || "null");

    if (note) {
      noteTitle.value = note.title || "";
      notesInput.value = note.content || "";
    }
  } catch {
    notesStatus.textContent = "Ready";
  }
}

function saveNote() {
  try {
    localStorage.setItem("novadesk-note", JSON.stringify({
      title: noteTitle.value,
      content: notesInput.value,
      updatedAt: new Date().toISOString()
    }));

    notesStatus.textContent = "Saved ✓";
  } catch {
    notesStatus.textContent = "Couldn't save";
  }
}

loadNote();

let noteSaveTimeout;

[noteTitle, notesInput].forEach((element) => {
  element.addEventListener("input", () => {
    notesStatus.textContent = "Saving...";
    clearTimeout(noteSaveTimeout);
    noteSaveTimeout = setTimeout(saveNote, 400);
  });
});

$("#save-note").addEventListener("click", saveNote);

$("#clear-note").addEventListener("click", () => {
  notesInput.value = "";
  noteTitle.value = "";
  saveNote();
});

/* EDITABLE NOTE SUGGESTIONS */
const defaultSuggestions = [
  "Today's goals",
  "Study plan",
  "Project ideas",
  "Things to learn",
  "Weekly review"
];

let suggestions;

try {
  suggestions = JSON.parse(localStorage.getItem("novadesk-suggestions")) || defaultSuggestions;

  if (!Array.isArray(suggestions)) {
    suggestions = [...defaultSuggestions];
  }
} catch {
  suggestions = [...defaultSuggestions];
}

function saveSuggestions() {
  localStorage.setItem("novadesk-suggestions", JSON.stringify(suggestions));
}

function renderSuggestions() {
  const list = $("#suggestion-list");
  list.replaceChildren();

  suggestions.forEach((suggestion, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "suggestion-chip";
    chip.title = "Click to insert this suggestion into your notes";

    const label = document.createElement("span");
    label.textContent = suggestion;
    chip.appendChild(label);

    const remove = document.createElement("span");
    remove.className = "remove-chip";
    remove.textContent = "×";
    remove.title = "Remove suggestion";
    remove.setAttribute("aria-label", "Remove " + suggestion);
    chip.appendChild(remove);

    chip.addEventListener("click", (event) => {
      if (event.target === remove) {
        suggestions.splice(index, 1);
        saveSuggestions();
        renderSuggestions();
        return;
      }

      const prefix = notesInput.value.trim() ? "\n\n" : "";
      notesInput.value += prefix + suggestion + ":\n";
      notesInput.focus();
      notesStatus.textContent = "Editing...";
      saveNote();
    });

    list.appendChild(chip);
  });
}

renderSuggestions();

$("#suggestion-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#suggestion-input");
  const value = input.value.trim();

  if (!value) return;

  if (suggestions.some((item) => item.toLowerCase() === value.toLowerCase())) {
    input.value = "";
    return;
  }

  suggestions.push(value);
  saveSuggestions();
  input.value = "";
  renderSuggestions();
});

/* FOCUS TIMER */
let remainingSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;

const timerDisplay = $("#timer-display");
const timerRing = $("#timer-ring");
const timerLabel = $("#timer-label");
const minutesInput = $("#focus-minutes");

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(remainingSeconds);

  const total = Math.max(1, Number(minutesInput.value) * 60);
  const progress = Math.max(0, Math.min(1, remainingSeconds / total));
  const restColor = document.body.classList.contains("light-theme") ? "#deddf0" : "#22223a";

  timerRing.style.background =
    `conic-gradient(from -90deg, #a78bfa 0%, #5ee7f5 ${progress * 100}%, ${restColor} ${progress * 100}%)`;
}

function resetTimer() {
  clearInterval(timerInterval);

  timerInterval = null;
  timerRunning = false;

  const minutes = Math.max(1, Math.min(600, Number(minutesInput.value) || 25));

  minutesInput.value = minutes;
  remainingSeconds = minutes * 60;
  timerLabel.textContent = "READY TO FOCUS";
  $("#start-timer").textContent = "Start focus";

  renderTimer();
}

minutesInput.addEventListener("change", () => {
  if (!timerRunning) resetTimer();
});

$("#start-timer").addEventListener("click", () => {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;

    $("#start-timer").textContent = "Resume focus";
    timerLabel.textContent = "PAUSED";
    return;
  }

  if (remainingSeconds <= 0) resetTimer();

  timerRunning = true;
  timerLabel.textContent = "FOCUS IN PROGRESS";
  $("#start-timer").textContent = "Pause";

  timerInterval = setInterval(() => {
    remainingSeconds--;
    renderTimer();

    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning = false;

      timerLabel.textContent = "SESSION COMPLETE";
      $("#start-timer").textContent = "Start again";

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("NovaDesk", {
          body: "Your focus session is complete. Nice work!"
        });
      }
    }
  }, 1000);
});

$("#reset-timer").addEventListener("click", resetTimer);
resetTimer();

/* ROBOT: HAPPY JUMP */
const robot = $("#robot");
const robotStatus = $("#robot-status");
let jumpTimeout;

robot.addEventListener("click", () => {
  robot.classList.remove("jump");
  void robot.offsetWidth;
  robot.classList.add("jump");

  clearTimeout(jumpTimeout);

  jumpTimeout = setTimeout(() => {
    robot.classList.remove("jump");
  }, 800);

  const reactions = [
    "Wheee! ✨ Let's make today count!",
    "Boing! One little step closer to your goals!",
    "You clicked me! Now, what are we learning?",
    "Jumping for joy! Keep being curious!",
    "Hey, builder! What will you create next?",
    "A little fun makes the journey better. 🌟"
  ];

  robotStatus.textContent = reactions[Math.floor(Math.random() * reactions.length)];
});

/* 200 GROWTH QUESTIONS */
const growthQuestions = [
  "What is one thing you want to improve about yourself?",
  "What does success mean to you personally?",
  "What skill would make your future easier?",
  "What is one small goal you can complete today?",
  "What habit would you like to build?",
  "What habit would you like to spend less time on?",
  "What makes you feel proud of your progress?",
  "What is something new you want to learn this month?",
  "What is one thing you can do when you feel overwhelmed?",
  "How can you make your mornings more useful?",
  "What kind of person do you want to become?",
  "What does a good day look like for you?",
  "What is something you have improved at recently?",
  "What is one mistake that taught you something useful?",
  "What would you try if you were less afraid of failing?",
  "What helps you concentrate when you study?",
  "How do you decide what matters most?",
  "What is one distraction you could reduce?",
  "What is something you want to understand better?",
  "How can you celebrate progress without needing perfection?",
  "What is your biggest goal for this year?",
  "What would you like to be able to do in five years?",
  "Which skill are you most excited to develop?",
  "What does being disciplined mean to you?",
  "How do you recover after a disappointing day?",
  "What is one promise you want to keep to yourself?",
  "How can you make difficult tasks easier to start?",
  "What does being independent mean to you?",
  "What would your future self thank you for doing today?",
  "What is something you can stop postponing?",
  "How do you stay curious about the world?",
  "What kind of problems do you enjoy solving?",
  "What is one thing you want to build or create?",
  "How can you turn an idea into a small experiment?",
  "What does creativity mean to you?",
  "What is a useful question you rarely ask yourself?",
  "How do you know when you truly understand something?",
  "What could you teach someone else today?",
  "What is something you used to find difficult?",
  "What would you like to practice consistently?",
  "How do you choose between several interesting goals?",
  "What is the most important thing to learn at your age?",
  "How can you become a better problem solver?",
  "What would you like to learn without rushing?",
  "What makes learning enjoyable for you?",
  "How can you remember what you study more effectively?",
  "What is one topic you want to explore deeply?",
  "What does learning from experience mean to you?",
  "How do you handle not knowing the answer?",
  "What would help you become a more independent learner?",
  "How can you break a big project into smaller steps?",
  "What is a useful way to review your progress?",
  "What do you do when a lesson feels confusing?",
  "How can you make practice more interesting?",
  "What is one question you want to investigate?",
  "How do you decide whether a source is trustworthy?",
  "What is something you learned outside school?",
  "How can you get better at explaining ideas?",
  "What makes feedback helpful?",
  "What would you like to understand well enough to teach?",
  "How can you improve your writing?",
  "How can you improve your speaking?",
  "What would make you more confident presenting ideas?",
  "How do you listen when someone disagrees with you?",
  "What makes someone easy to communicate with?",
  "How can you ask better questions?",
  "How do you explain a complicated idea simply?",
  "What could you do to become a better listener?",
  "How can you disagree respectfully?",
  "What makes a conversation meaningful?",
  "How can you build stronger friendships?",
  "What does being reliable mean to you?",
  "How can you show appreciation to others?",
  "What do you do when you misunderstand someone?",
  "How can you become more comfortable asking for help?",
  "What makes teamwork effective?",
  "How can you give useful feedback kindly?",
  "What is one thing you admire in a good leader?",
  "How can you become someone others can trust?",
  "What do you want to learn about working with people?",
  "How do you respond when plans change?",
  "What helps you make decisions calmly?",
  "How can you separate facts from assumptions?",
  "What is a decision you can make more thoughtfully?",
  "How do you decide when to ask for advice?",
  "What can you do when two priorities compete?",
  "How do you know when to change your approach?",
  "What is one boundary that helps protect your time?",
  "How can you take responsibility for your choices?",
  "What would help you become more adaptable?",
  "How do you deal with uncertainty?",
  "What is a small decision you can make today?",
  "How do you learn from another person's perspective?",
  "What makes a goal realistic?",
  "How do you tell the difference between urgent and important?",
  "What can you do before making a difficult choice?",
  "How can you become more thoughtful about your time?",
  "What is a value you want your decisions to reflect?",
  "What is one thing you appreciate about yourself?",
  "How can you treat yourself more patiently while learning?",
  "What usually gives you energy?",
  "What helps you feel calm after a busy day?",
  "How can you create more time for rest?",
  "What does a balanced week look like for you?",
  "How can you make room for hobbies?",
  "What is something that makes an ordinary day better?",
  "How can you build a routine that fits your life?",
  "What is one way to take care of your future self?",
  "What helps you reset when you feel distracted?",
  "How can you make your workspace more comfortable?",
  "What is one thing you can prepare in advance?",
  "What kind of environment helps you learn?",
  "How can you make a free afternoon meaningful?",
  "What does being productive mean beyond being busy?",
  "What is something you can simplify in your day?",
  "How can you make time for the people who matter?",
  "What helps you keep going through a busy week?",
  "How can you make routines feel less repetitive?",
  "What is a healthy way to celebrate a small win?",
  "How can you notice progress that is easy to overlook?",
  "What would make your daily life more organized?",
  "What do you want to spend more time doing?",
  "What do you want to spend less time worrying about?",
  "What is one task you could finish in ten minutes?",
  "How can you prepare for a challenging school day?",
  "What study method works best for you?",
  "How can you make revision less stressful?",
  "What is one subject you want to understand better?",
  "How can you ask your teacher a useful question?",
  "What can you do when homework feels difficult?",
  "How do you decide what to revise first?",
  "What helps you remember information during exams?",
  "How can you learn from a test result?",
  "What does doing your best mean when time is limited?",
  "How can you create a realistic study schedule?",
  "What would help you start homework sooner?",
  "How can you make school projects more manageable?",
  "What is one academic goal you can track?",
  "How can you use mistakes to guide revision?",
  "What helps you balance school and other interests?",
  "How can you make better use of short study sessions?",
  "What is something useful you learned this week?",
  "How can you measure understanding rather than memorization?",
  "What would make studying feel more purposeful?",
  "What technology skill would you like to learn?",
  "What interests you about artificial intelligence?",
  "What problem would you like to solve with code?",
  "How could a simple website help someone?",
  "What is one small app you would like to create?",
  "How can you learn coding by building projects?",
  "What does understanding code mean to you?",
  "How can you check whether AI-generated code works?",
  "What should you do when your program has a bug?",
  "What is one automation that could save time?",
  "What makes a digital product useful?",
  "How can you make a website easier to use?",
  "What would you like to learn about cybersecurity?",
  "How can you use AI responsibly for learning?",
  "What makes a good question for an AI assistant?",
  "How can you check an AI answer for accuracy?",
  "What kind of project would make a good portfolio piece?",
  "How could you improve a project after feedback?",
  "What technology trend would you like to understand?",
  "How can you explain your project to a beginner?",
  "What is the smallest version of your big idea?",
  "How can you test whether people need your idea?",
  "What makes a product worth using?",
  "How could you turn a repeated problem into a project?",
  "What would you want to know before starting a business?",
  "How can you understand the people you want to help?",
  "What makes a business idea useful rather than merely exciting?",
  "How can you practice explaining the value of an idea?",
  "What is something you could create without spending money?",
  "How can you learn from products you already use?",
  "What would make a project easier to maintain?",
  "How can you make a first version without overcomplicating it?",
  "What does building in public teach you?",
  "How can you show your learning progress honestly?",
  "What is one small problem you notice around you?",
  "How can you get feedback without taking it personally?",
  "What would you change after a project fails?",
  "How can you tell whether an improvement actually helps?",
  "What makes you excited to keep building?",
  "What would you like your first portfolio to demonstrate?",
  "How can you combine creativity and technical skills?",
  "What is one useful thing you could teach online?",
  "How can you make a project accessible to more people?",
  "What would you like to build during your next free day?",
  "What does confidence look like when you are still learning?",
  "How can you stop comparing your progress with someone else's?",
  "What can you learn from someone younger or more experienced?",
  "How can you respond constructively to criticism?",
  "What do you do when progress feels slow?",
  "How can you be ambitious without rushing every decision?",
  "What is one thing you can control today?",
  "How can you turn frustration into a useful next step?",
  "What would help you restart after missing a day?",
  "How can you stay consistent without being perfect?",
  "What does patience look like in your current goals?",
  "How can you recognize when you need a break?",
  "What is something you should give yourself credit for?",
  "How can you become more comfortable being a beginner?",
  "What is one fear you could approach gradually?",
  "How can you build confidence through practice?",
  "What can a disappointing result teach you?",
  "How can you make goals challenging but manageable?",
  "What does resilience mean in everyday life?",
  "How can you avoid making one bad day define your progress?",
  "What is a personal strength you want to develop?",
  "What would you like to be remembered for creating?",
  "What kind of impact would you like to have?",
  "How can you use your skills to help someone?",
  "What makes you feel curious about the future?",
  "What is something important you want to experience?",
  "How can you keep your interests while focusing on priorities?",
  "What does a meaningful life look like to you?",
  "What do you want to understand about yourself?",
  "What would you like to be able to say you tried?",
  "How can you become more intentional with your attention?",
  "What is one thing you can do today that your future self will appreciate?",
  "What are three things you want to learn this year?",
  "How can you make your goals more specific?",
  "What would you like to accomplish before the next school year?",
  "What is one small step toward your biggest ambition?",
  "How can you make a weekly reflection part of your routine?",
  "What is something you want to stop putting off?",
  "How can you keep track of the skills you are developing?",
  "What is one thing you want to try for the first time?",
  "What would you like to thank yourself for at the end of this month?"
];

console.info("NovaDesk growth questions loaded:", growthQuestions.length);

const questionList = $("#question-list");
const questionCount = $("#question-count");

let questionOffset = 0;
let currentAnswer = "Hey! Pick a question above or type something you'd like to talk about. Let's figure it out together. ✨";

function renderQuestions() {
  questionList.replaceChildren();

  const count = Math.min(6, growthQuestions.length);

  for (let i = 0; i < count; i++) {
    const index = (questionOffset + i) % growthQuestions.length;
    const button = document.createElement("button");

    button.type = "button";
    button.className = "question-chip";
    button.textContent = growthQuestions[index];

    button.addEventListener("click", () => {
      $("#chat-input").value = growthQuestions[index];
      answerQuestion(growthQuestions[index]);
    });

    questionList.appendChild(button);
  }

  questionCount.textContent = `${growthQuestions.length} QUESTIONS`;
}

$("#more-questions").addEventListener("click", () => {
  questionOffset = (questionOffset + 6) % growthQuestions.length;
  renderQuestions();
});

renderQuestions();

/* LOCAL COACHING REPLIES
   These replies are built in. They do not call an external AI service. */
function respondToNova(message) {
  const text = message.toLowerCase();

  const replies = [
    {
      match: /study|school|exam|homework|revision|learn/,
      answer: "Let's make learning manageable. Choose one topic, work on it for a short focused session, then test yourself without looking at your notes. What is the smallest part you can start with today?"
    },
    {
      match: /code|coding|python|javascript|html|css|program|website|app|software/,
      answer: "My suggestion: learn one small concept, use it in a tiny project, and understand every part before adding more. When something breaks, read the error and investigate it step by step. What are you trying to build?"
    },
    {
      match: /ai|artificial intelligence|machine learning|model/,
      answer: "AI is a fascinating field to explore. Start with the fundamentals, experiment with small projects, and verify what AI tools tell you. Understanding the result matters more than simply generating it. Which part interests you most?"
    },
    {
      match: /goal|future|dream|ambition|success|career/,
      answer: "Big ambitions become easier to manage when you turn them into smaller milestones. Pick one direction to explore, choose a useful skill, and set a realistic next step. You can adjust your plan as you learn more."
    },
    {
      match: /habit|discipline|consistent|procrastinat|lazy|motivation/,
      answer: "Try making the starting step so small that it feels manageable. Set a clear time, reduce one distraction, and focus on showing up rather than doing everything perfectly. Motivation can change; a realistic routine gives you something to return to."
    },
    {
      match: /stress|overwhelm|anxious|worry|pressure|tired/,
      answer: "Pause for a moment. You don't have to solve every problem at once. Write down what's on your mind, choose what actually needs attention first, and allow yourself a reasonable break. What is the main thing weighing on you right now?"
    },
    {
      match: /fail|failure|mistake|wrong|setback|give up|quit/,
      answer: "A setback is information, not a final verdict on your ability. Look at what happened, identify one thing you can change, and decide on a manageable next attempt. You are allowed to learn as you go."
    },
    {
      match: /friend|communicat|talk|people|relationship|team/,
      answer: "Good communication starts with listening, asking clear questions, and being honest without being unkind. Try to understand the other person's point of view before deciding how to respond."
    },
    {
      match: /idea|business|startup|product|entrepreneur/,
      answer: "Start with a real problem rather than a complicated product. Talk to people who experience that problem, make the simplest useful version, and ask for feedback. You can improve it once you understand what people actually need."
    },
    {
      match: /confiden|compare|jealous|behind|insecure/,
      answer: "Your progress does not have to match someone else's timeline. Compare your current skills with what you knew before, notice what you have learned, and choose one thing you want to practice next."
    },
    {
      match: /time|schedule|organize|routine|plan|productive/,
      answer: "Write down your commitments, choose the most important task, and give it a realistic time slot. Leave some room for breaks and unexpected things. A useful plan helps you, rather than making every minute feel like a test."
    },
    {
      match: /money|finance|save|budget/,
      answer: "A helpful starting point is learning how budgeting, saving, spending, and risk work. Practice making thoughtful choices with small amounts and be cautious of promises of quick money. Financial understanding grows over time."
    },
    {
      match: /thank|hello|hi\b|hey\b|sup\b/,
      answer: "Hey! 👋 Glad you're here. We can talk about learning, habits, goals, school, technology, or whatever you're trying to figure out. What's on your mind?"
    }
  ];

  const found = replies.find((item) => item.match.test(text));

  if (found) return found.answer;

  return "Let's think this through together. First, describe what you want to achieve. Then identify what's stopping you, what you already know, and one small action you can take next. You don't need a perfect plan to begin. What's the next step that feels realistic for you?";
}

function answerQuestion(message) {
  const answer = respondToNova(message);

  currentAnswer = answer;
  $("#chat-response").textContent = answer;
  $("#robot-status").textContent = "I'm listening! Let's figure things out together. ✨";
  $("#chat-input").value = "";
  $("#chat-response").scrollTop = 0;
}

$("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const message = $("#chat-input").value.trim();

  if (message) {
    answerQuestion(message);
  }
});

/* SPEAK ANSWER / STOP SPEAKING */
const speakButton = $("#speak-answer");
const stopButton = $("#stop-speaking");

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

speakButton.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    robotStatus.textContent = "Speech output isn't supported in this browser.";
    return;
  }

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(currentAnswer);
  utterance.rate = 0.95;
  utterance.pitch = 1.12;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => /en-US|en-GB/i.test(voice.lang));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    speakButton.textContent = "🔊 Speaking...";
    robotStatus.textContent = "Listen up! I'm speaking my answer. 🎙️";
  };

  utterance.onend = () => {
    speakButton.textContent = "🔊 Speak answer";
    robotStatus.textContent = "All done! Want to explore another question?";
  };

  utterance.onerror = () => {
    speakButton.textContent = "🔊 Speak answer";
  };

  window.speechSynthesis.speak(utterance);
});

stopButton.addEventListener("click", () => {
  stopSpeaking();
  speakButton.textContent = "🔊 Speak answer";
  robotStatus.textContent = "Speech stopped. Choose another question whenever you're ready.";
});
