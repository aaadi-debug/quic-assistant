import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');   // The querySelector() method returns the first element that matches a CSS selector.                    
const chatContainer = document.querySelector('#chat_container');

// --------------------------------------------- ai html dynamic variables
// const speakBtn = document.querySelector('#speak_aloud');
// const speakIcon = document.querySelector('#speak_icon');


// speakBtn.addEventListener("click", speakBtnClick);
// function speakBtnClick() {
//   if(speakIcon.classList.contains("fa-volume-high")) { // Start Speaking
//       speakIcon.classList.remove("fa-volume-high");
//       speakIcon.classList.add("fa-volume-xmark");
//       // recognition.start();
//   }
//   else {  // Stop Speaking
//       speakIcon.classList.remove("fa-volume-xmark");
//       speakIcon.classList.add("fa-volume-high");
//       // recognition.stop();
//   }
// }
// ---------------------------------------------


// ********************************************* - speech snthesis

var btnSpeak = document.querySelector('#btn_speak')
var voiceList = document.querySelector('#voice_list')

var synth = window.speechSynthesis;
var voices = [];

PopulateVoices();
if(speechSynthesis !== undefined){
    speechSynthesis.onvoiceschanged = PopulateVoices;
}


function PopulateVoices(){
  voices = synth.getVoices();
  var selectedIndex = voiceList.selectedIndex < 0 ? 0 : voiceList.selectedIndex;
  voiceList.innerHTML = '';
  voices.forEach((voice)=>{
      var listItem = document.createElement('option');
      listItem.textContent = voice.name;
      listItem.setAttribute('data-lang', voice.lang);
      listItem.setAttribute('data-name', voice.name);
      voiceList.appendChild(listItem);
  });

  voiceList.selectedIndex = selectedIndex;
}
// **********************************************

//for loading dots while searching for answers
let loadDots  

function loader(element) {
  element.textContent = ''  // The textContent property sets or returns the text content of the specified node, and all its descendants.


// The setInterval() method calls a function at specified intervals (in milliseconds).
// The setInterval() method continues calling the function until clearInterval() is called, or the window is closed.
// 1 second = 1000 milliseconds.

  loadDots = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if(element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {  //bot typing letter by letter in every 20ms
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length) {        // means we are still typing
      element.innerHTML += text.charAt(index);  // get character under a specific index The charAt() method returns the character at a specified index (position) in a string.

                                                // The index of the first character is 0, the second 1, ...
      index++;
    } else {                  
      clearInterval(interval);
    }
  }, 20)
}

// generating a unique id for every single message to map over them
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();                         //Date.now() returns the number of milliseconds since January 1, 1970.
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// when we ask question and AI answers to us                         
function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
          <button id="speak_aloud" type='button'>
            <i 
              id="speak_icon"
              class="${isAi ? 'fa-solid fa-volume-high' : ''}" 
              style="color: #8d5315;"
            ></i>
          </button>
      </div>
  `
  )
}


// AI generated response
const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))    //false because it's user typing not AI

  // to clear the textarea input 
  form.reset()

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)         //true because it's AI typing not user &  " " for AI generated answers after 4 dots(...) loading



// **********************************************************************   - speech synthesis
  btnSpeak.addEventListener('click', ()=> {
    var toSpeak = new SpeechSynthesisUtterance(chatContainer.innerHTML);
    var selectedVoiceName = voiceList.selectedOptions[0].getAttribute('data-name');
    voices.forEach((voice)=>{
        if(voice.name === selectedVoiceName){
            toSpeak.voice = voice;
        }
    });
    synth.speak(toSpeak);
  });
// **********************************************************************


  
  // auto-scroll
  chatContainer.scrollTop = chatContainer.scrollHeight;             // for keep on scrolling automatically

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)   

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  //fetch data from server -> bot's response 
  //after setting up backend, then we are coding this
  const response = await fetch('https://quic-assistant.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      
    },
    body: JSON.stringify({
      prompt: data.get('prompt')   // this data message will come from textarea element on the screen
    })
  })

  clearInterval(loadDots);         //after getting response clear the interval
  messageDiv.innerHTML = '';       //empty so that we are able to be add message

  if(response.ok) {
    const data = await response.json();   //gives us actual response coming from backend
    const parsedData = data.bot.trim();   //parsing the data

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    console.log(err);

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

// form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {                           //for submitting by pressing enter key
  if (e.keyCode === 13) {                                         // 13 is ASCII value of enter key
      handleSubmit(e)
  }
})