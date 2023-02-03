const gameArea = document.querySelector('#gamearea')
const keyboardArea = document.querySelector('#keyboard')
const messageDisplay = document.querySelector('#message')
const _ = (selector) => {
    return document.getElementById(selector)
}

// Selecting wordle word according to date
let wordleWords = retrieveFromLocal("Wordle_Words")
// the date when game began
// In original wordle, it is 19th of June 2021 (set by author)
const gameBeginning = new Date('29 Mar 2022').setHours(0, 0, 0, 0); 
// today's date
let today = new Date();    
// Finding difference between today and beginning date.  
// In JavaScript, the Date object is represented by a number of milliseconds 
// since 1 January 1970, 00:00:00 UTC, with leap seconds ignored
//Dividing it by the number 864e5 and rounding of it. 
// 864e5 is the same as 86400000 or 1000*60*60*24 and represents 24 hours or a day.
const dateIndex = (beginning, date) =>
    Math.round((date.setHours(0, 0, 0, 0) - beginning) / 864e5)
// Choosing the wordle word by calculating remainder with wordleWords array length
const wordleForDate = (date) =>
    wordleWords[dateIndex(gameBeginning, date) % wordleWords.length];
// word of the day
let wordle = wordleForDate(today).toUpperCase()  

let currentRow = 0          
let currentCol = 0
let isGameOver = false

// word of the day    


// Game Rows creation - 6 rows as there are 6 guesses allowed 
// and 5 columns since the wordle is a 5 letter word
const gameRows = [
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
]
// For each row, we create a div element dynamically
gameRows.forEach((row,rowindex) => {
    const rowElement = document.createElement('div')
    rowElement.setAttribute('id','row'+rowindex)
    rowElement.setAttribute('class','rows')
    // For each col in a row, a div element is created
    row.forEach((col,colindex) => {             
        const colElement = document.createElement('div')
        colElement.setAttribute('id','row'+rowindex+'-col'+colindex)
        colElement.setAttribute('class','cols')
        rowElement.append(colElement)        
    })
    // The divs are added to game-area section of the page
    gameArea.append(rowElement)     
})
// Keyboard Creation
const keys = ['Q','W','E','R','T','Y','U','I','O',
'P','A','S','D','F','G','H','J','K','L','ENTER',
'Z','X','C','V','B','N','M','<<']
// For each key in the keys[], a div element is created
keys.forEach(key => {           
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key
    buttonElement.setAttribute('id',key)
    buttonElement.setAttribute('class','keyboard-keys')
    buttonElement.addEventListener('click',() => buttonClicked(key))
    keyboardArea.append(buttonElement)
})     

// Adding functionality to KeyBoard Keys
const buttonClicked = (key) => {
    // If enter is clicked, check the letters in the current row. 
    // If it's wrong, go for the next attempt (i.e, next row), if possible
    if(key === 'ENTER' && isGameOver == false){    
        checkRow()
        return
    }
    // If delete is clicked, delete the last entered letter
    if(key === '<<'|| key === 'BACKSPACE'){       
        deleteLetter()
        return
    }    
    // Populate the game area with the letter entered
    addLetter(key)      
}
const addLetter = (guess) => {
   if(currentRow < 6 && currentCol < 5){
    const guessBox = _('row'+currentRow+'-col'+currentCol)
    guessBox.textContent = guess
    guessBox.setAttribute('data',guess)        
    // edits the gameRows array accordingly 
    gameRows[currentRow][currentCol] = guess    
    // store gameRows in localStorage
    setToLocal("gameRows",gameRows)
    // move to the next box
    currentCol++                                
   }
}
const deleteLetter = () => {
    // Checking whether current col is valid for deletion
    if(currentCol > 0 && isGameOver == false){         
        currentCol--
        // fetching tile of given id
        const guessBox = _('row'+currentRow+'-col'+currentCol) 
         // value of tile
        guessBox.textContent = ''              
        // data attribute value of tile
        guessBox.setAttribute('data','')        
        // modifying gameRows array
        gameRows[currentRow][currentCol] = ''   
    }
} 
const checkRow = () => {
    let validWords = retrieveFromLocal("Valid_Words")
    // currentCol becomes incremented by 1 at index 4 due to addLetter()
    if(currentCol > 4){   
        // this is the user input
        const guess = gameRows[currentRow].join('')         
        // if input is same as wordle, then you've won
        if(guess == wordle){            
             // flipping tile animation                
            flipTile() 
            // message and time for which it is to be shown                                    
            showMessage("Congrats!",3000)      
            // the game is over      
            isGameOver = true                           
            return
        }
        // since words are stored in lowercase in word lists
        else if(validWords.includes(guess.toLowerCase())||wordleWords.includes(guess.toLowerCase())){      
            // flipping tile animation
            flipTile() 
            // If you use up all 6 attempts, the game is over                                     
            if(currentRow >=5 && isGameOver == false){             
                // Displays the wordle and time for which it is to be shown           
                showMessage(wordle,5000)                         
                isGameOver = true
                return
            }
            // If you've remaining attempts, move to the next row
            else if(currentRow < 5){                        
                currentRow++
                // go to first tile in new row
                currentCol = 0              
            }
        }
        else{
            // message and time for which it is to be shown     
            showMessage("Word not in list",200)  
        }
    }    
}
const showMessage = (message,time) => {        
    // p tag in which message is added              
    const messageElement = document.createElement('p')          
    messageElement.textContent = message
    // added to the message section
    messageDisplay.append(messageElement)                    
    // message to be removed after 2s   
    setTimeout(() => messageDisplay.removeChild(messageElement),time)   
}
const addKeyColour = (keyLetter,colour) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(colour)
}
const flipTile = () => {            
    // collecting all cols of current row
    const rowTiles = document.querySelector('#row'+currentRow).childNodes       
    // assigning wordle to a temporary variable, word
    let word = wordle                       
    rowTiles.forEach((tile,index) => {
        // getting the letter of given tile and converting to lowercase since the 
        const tileLetter = tile.getAttribute('data')    
        if(tileLetter == wordle[index]){
             // Removing the green-overlay letters from word so that they won't 
             // be coloured yellow. This bug occurs when there are repeated 
             // letters in wordle. Eg, GUESS has 2 S. If we input SSSSS, 
             // the first two S's would be yellow and last two would be green. 
             // To avoid this, we remove green-overlay letters from wordle earlier itself.
             //  We don't keep this inside setTimeout() to avoid messing with flipping 
             // tiles animation.
            word = word.replace(tileLetter,'')     
        }
        setTimeout(() => {
            tile.classList.add('flip')
            if(tileLetter == wordle[index]){
                // Green overlay to letters at correct position
                tile.classList.add('green-overlay')     
                addKeyColour(tileLetter,'green-overlay')
            }
            else if(word.includes(tileLetter)){
                // Yellow overlay to letters at wrong position
                tile.classList.add('yellow-overlay')    
                // Removing yellow-overlay letters from word to remove repeated letters bug issue.
                word = word.replace(tileLetter,'')      
                addKeyColour(tileLetter,'yellow-overlay')
            }
            else{
                // Grey overlay to letters not present in wordle
                tile.classList.add('grey-overlay')      
                addKeyColour(tileLetter,'grey-overlay')
            }
            // Each tile flips at a gap of 0.5s in the order of their index.
        },500*index)    
    })
}

// Adding on key press functionality in addition to on screen keyboard
window.addEventListener('keydown', function (e) {
    if((e.key.length==1 && e.key.charAt(0).match(/[a-z]/i)) || e.key.toUpperCase() === 'ENTER' || e.key.toUpperCase() == 'BACKSPACE') {
        buttonClicked(e.key.toUpperCase())
    }
    
  }, false);

let wordle_words = [];
let valid_words = [];
//Converting csv to arrays
var data;
function convertToCSV(fileName){
    $.ajax({
        type: "GET",  
        url: fileName,
        dataType: "text",       
        success: function(response)  
        {
            data = formWords(response)
            // storing the word lists in local storage with file name as the key   
            setToLocal(fileName.split(".")[0],data)     
        }   
      });
}
// Refining the word list response
const formWords = (wordList) => {
    let words = wordList.split("\n")
    for (let index = 0; index < words.length; index++) {
        words[index] = words[index].substring(1,words[index].length-1)
    }
    return words
}
// Storing word lists in local storage
function setToLocal(key,arr){
    // storing array as a String
    localStorage.setItem(key, JSON.stringify(arr));     
}
function retrieveFromLocal(key){
    let arr = localStorage.getItem(key);    // retrieving data
    return JSON.parse(arr)      // converting it back to array
}
// Calling functions to convert Wordle_Words.csv and Valid_Words.csv to arrays
convertToCSV("Wordle_Words.csv")
convertToCSV("Valid_Words.csv")  