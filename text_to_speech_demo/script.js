const synth = window.speechSynthesis;

const inputTxt = document.querySelector(".txt");
const voiceSelect = document.querySelector("select");
const volumeRange = document.getElementById("volumeSlider");
const snippetsEl = document.getElementById("snippets");
const historyEl = document.getElementById("history");
const clearHistoryButton = document.getElementById("clearButton");

let voices = [];
let alreadyRead = "";
let toSpeak = [];
let history = [];
let snippets = [
  "Hey everyone!",
  "Good morning!",
  "Hey, listen!",
  "Yes.",
  "No.",
  "Maybe.",
  "I don't know.",
  "What?",
  "Why?",
  "How?",
  "I lost my voice and can't talk right now."
]

// Buffer time in ms to wait after the user stops typing before speaking
let bufferTime = 0.5 * 1000;
let typingTimer;


function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase();
    const bname = b.name.toUpperCase();

    if (aname < bname) {
      return -1;
    } else if (aname == bname) {
      return 0;
    } else {
      return +1;
    }
  });
  const selectedIndex =
    voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = "";

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

for (const snippet of snippets){
  const snippetEl = document.createElement("button")
  snippetEl.textContent = snippet
  snippetEl.addEventListener("click", () => {
    toSpeak.push(snippet)
    speak()
  })
  snippetsEl.appendChild(snippetEl);
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
  if (synth.speaking) {
    console.error("speechSynthesis.speaking");
    return false;
  }

  let msg = toSpeak.shift();
  historyEl.textContent += msg;

  if (msg !== "") {
    alreadyRead += msg;
    console.log("Reading text:" + msg);
    const utterThis = new SpeechSynthesisUtterance(msg);

    utterThis.volume = volumeRange.value;

    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
      if (toSpeak.length > 0) {
        speak();
      }
    };

    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    const selectedOption =
      voiceSelect.selectedOptions[0].getAttribute("data-name");

    for (let i = 0; i < voices.length; i++) {
      if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
    synth.speak(utterThis);
    return true;
  }
  return false;
}

function speakInput(event) {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    if (
      [" ", ".", ",", "?", "!"].includes(
        inputTxt.value[inputTxt.value.length - 1]
      )
    ) {
      _speakInput();
    }
  }, bufferTime);
}

function _speakInput() {
  let newText = inputTxt.value;
  inputTxt.value = "";
  toSpeak.push(newText);
  speak();
}

inputTxt.addEventListener("input", speakInput);
inputTxt.addEventListener("change", _speakInput);

voiceSelect.addEventListener("change", function () {
  speak();
});

clearHistoryButton.addEventListener("click", () => {
  historyEl.textContent = ""
})
