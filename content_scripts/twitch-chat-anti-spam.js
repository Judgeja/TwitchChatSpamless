//let messages = document.getElementsByClassName("chat-line__message");
let _msgHistory = [];
let _hiddenNodes = [];
let _bannedMsgs = ["OMEGALUL", "KEKW", "PEPEGA", "SADGE", "POG", "POGGERS"];
let _bannedAuthors = ["StreamElements"];
var chatRoomContentElement;
var hiddenCountSpan;
var infoBoxClassName = "anti-spam-chat-info-container";
let isFilterActive = true;

let setupItvl = setInterval(()=>{
  trySetup();
}, 1000);

function trySetup(){
  if(document.getElementsByClassName(infoBoxClassName).length > 0){ return; }
  chatRoomContentElement = document.querySelector('.chat-room__content');
  if(chatRoomContentElement==null){ return; }
  
  var observer = new MutationObserver(onChatMessage);
  var config = {
    childList: true,
    attributes: true,
    characterData: false,
    subtree: true,
    //attributeFilter: ['one', 'two'],
    //attributeOldValue: false,
    //characterDataOldValue: false
   };
  observer.observe(chatRoomContentElement, config);
  setupInfoBox(chatRoomContentElement);
  //clearInterval(setupItvl);
}


function setupInfoBox(chatRoomContentElement){
  console.log("Setting up chatbox");
  let infoBox = document.createElement('div');
  infoBox.className = infoBoxClassName;

  hiddenCountSpan = document.createElement('p');
  hiddenCountSpan.textContent = "No messages hidden yet.. What a nice chat.";
  infoBox.append(hiddenCountSpan);

  let clickToShow = document.createElement('p');
  clickToShow.textContent = "Toggle Filter: Active";
  infoBox.append(clickToShow);

  infoBox.onclick= ()=> { 
    isFilterActive = !isFilterActive; 
    _hiddenNodes.forEach(n => n.hidden = isFilterActive); 
    clickToShow.textContent = "Toggle Filter: " + (isFilterActive ? "Active" : "Inactive");
  };

  chatRoomContentElement.prepend(infoBox)
}

function onChatMessage(mutations, observer){
  for(let m of mutations){
    for(let node of m.addedNodes){
      if(node.classList && node.classList.contains("chat-line__message")){
        runSpamHider(node);
      }
    }
  }
}

function runSpamHider(node){
  let authorNode = node.getElementsByClassName("chat-author__display-name")[0];
  let textFragments = node.getElementsByClassName("text-fragment");
  let text = "";
  let isEmoticonOnly = false;
  if(textFragments != null && textFragments.length > 0){
    text = reduceText(textFragments[0].textContent);
  }
  else {
    isEmoticonOnly = true;
  }

  let isCommand = (text.length > 0 && text[0] == "!") 
  if(isCommand || isEmoticonOnly
    || _msgHistory.indexOf(text) >= 0 
    || _bannedMsgs.indexOf(text.toUpperCase()) >= 0 
    || _bannedAuthors.indexOf(authorNode.textContent) >= 0 ){

      console.log(text, "Hiding message: Because one of the following..", node);
      console.log("isCommand ", isCommand ) ;
      console.log("isEmoticonOnly", isEmoticonOnly) ;
      console.log("_msgHistory.indexOf(text) >= 0 ", _msgHistory.indexOf(text) >= 0 ) ;
      console.log("_bannedMsgs.indexOf(text.toUpperCase()) >= 0 ", _bannedMsgs.indexOf(text.toUpperCase()) >= 0 ) ;
      console.log("_bannedAuthors.indexOf(authorNode.textContent) >= 0 ", _bannedAuthors.indexOf(authorNode.textContent) >= 0 ) ;

    node.hidden = true;
    _hiddenNodes.push(node);
  }

  _msgHistory.push(text);
  var currentlyHiddenCount = _hiddenNodes.filter(x=> x.hidden).length;
  var percentSpam =  Math.round((currentlyHiddenCount * 100 / _msgHistory.length) * 100) / 100;
  hiddenCountSpan.textContent = currentlyHiddenCount + " messages hidden. (" + percentSpam + "% spam)";
}

function reduceText(text){
  return text.replace(/(.)\1+/g, '$1').trim();
}