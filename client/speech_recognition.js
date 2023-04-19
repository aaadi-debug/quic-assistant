const searchForm = document.querySelector('form')
const searchFormInput = searchForm.querySelector('textarea')


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(SpeechRecognition) {
    console.log("Your Browser supports Speech Recognition");

    searchForm.insertAdjacentHTML("beforeend", '<button type="button"> <i class="fa-solid fa-microphone-slash fa-xl" style="color: #8d5315;"></i> </button>')

    const micBtn = searchForm.querySelector('button')
    const micIcon = searchForm.querySelector('i')

    const recognition = new SpeechRecognition();
    recognition.continuous = true;

    // Set the language to use for recognition
    recognition.lang = 'en-US'; // English (US)

    // Add additional languages to recognize
    recognition.lang += ',el-GR'; // Greek
    recognition.lang += ',es-ES'; // Spanish (Spain)
    recognition.lang += ',fr-FR'; // French (France)
    recognition.lang += ',de-DE'; // German (Germany)
    recognition.lang += ',it-IT'; // Italian (Italy) 

    micBtn.addEventListener("click", micBtnClick);
    function micBtnClick() {
        if(micIcon.classList.contains("fa-microphone-slash")) { // Start Speech Recognition
            micIcon.classList.remove("fa-microphone-slash");
            micIcon.classList.add("fa-microphone");
            recognition.start();
        }
        else {  // Stop Speech Recognition
            micIcon.classList.remove("fa-microphone");
            micIcon.classList.add("fa-microphone-slash");
            recognition.stop();
        }
    }

    recognition.addEventListener('start', startSpeechRecognition); // <=> recognition.onstart = funciton() {...}
    function startSpeechRecognition() {
        micIcon.classList.remove("fa-microphone-slash");
        micIcon.classList.add("fa-microphone");
        searchFormInput.focus();
        console.log("Speech Recognition Active");
    }

    recognition.addEventListener('end', endSpeechRecognition); // <=> recognition.onstart = funciton() {...}
    function endSpeechRecognition() {
        micIcon.classList.remove("fa-microphone");
        micIcon.classList.add("fa-microphone-slash");
        searchFormInput.focus();
        console.log("Speech Recognition Disconnected");
    }

    recognition.addEventListener('result', resultOfSpeechRecognition); // <=> recognition.onstart = funciton() {...}
    function resultOfSpeechRecognition(event) {
        // event.preventDefault();
        const currentResultIndex = event.resultIndex;
        console.log(event);
        const transcript = event.results[currentResultIndex][0].transcript;
        searchFormInput.value = transcript;

        if(transcript.toLowerCase().trim() ===  'stop recording') {
            recognition.stop();
        }
        else if(!searchFormInput.value) {
            searchFormInput.value = transcript;
        }
        else {
            if(transcript.toLowerCase().trim() === 'go') {
                searchForm.submit();
            }
            else if(transcript.toLowerCase().trim() === 'reset input') {
                searchFormInput.value = "";
            }
            else {
                searchFormInput.value = transcript;
            }
        }

        // setTimeout(() => {       //automatic submit
        //     searchForm.submit();
        // }, 750);
    }
    // info.textContent = 'Voice Commands: "stop recording", "reset input", "go"';

} else {
    console.log("Your Browser does not support Speech Recognition");

    // info.textContent = "Your Browser does not support Speech Recognition";
}


{/* <i class="fa-solid fa-microphone-slash fa-xl" style="color: #ffffff;"></i> */}