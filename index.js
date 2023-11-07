import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://to-do-list-d62af-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const toDoListInDB = ref(database, "toDoList")



let taskNameEl = document.getElementById("add-name");
let taskDateEl = document.getElementById("add-date");
let addItemBtn = document.getElementById("add-btn");
let taskList = document.getElementById("task-list");

let listItems = []; 

addItemBtn.addEventListener("click", function() {
    let inputNameValue = taskNameEl.value
    let inputDateValue = taskDateEl.value

    console.log("button pressed")

    let newEl = document.createElement("li")
    
    newEl.textContent = `Name: ${inputNameValue}, Date: ${inputDateValue}`
    
    taskList.append(newEl)
})


//make input into object

//function to render new object when added (also used to render all items from database)