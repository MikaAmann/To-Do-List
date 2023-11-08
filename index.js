import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://to-do-list-d62af-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const toDoListInDB = ref(database, "toDoList")


const taskNameEl = document.getElementById("add-name");
const taskDateEl = document.getElementById("add-date");
const addItemBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");

addItemBtn.addEventListener("click", function() {

    if(taskNameEl.value === "" || taskDateEl.value === ""){
        alert("Both fields must contain values!")
        return
    }

    let inputNameValue = taskNameEl.value
    let inputDateValue = taskDateEl.value

    let newTask = taskToObject(inputNameValue, inputDateValue)

    let taskIDinDB = push(toDoListInDB, newTask).key

    newTask.id = taskIDinDB

    set(ref(database, 'toDoList/' +taskIDinDB), {
        id: newTask.id,
        name: newTask.name,
        date: newTask.date,
        state: newTask.state
    });

    clearInputFields();
})



onValue(toDoListInDB, function(snapshot) {
    
    if(snapshot.exists()){

        let itemsArray = Object.entries(snapshot.val())
        
        clearTaskListEl()
    
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
    
            appendItemToTaskListEl(currentItem)
        }
    }
    else{
        taskList.innerHTML = "No tasks here... yet"
    }
})


function taskToObject(inputNameValue, inputDateValue){

    let taskObj = {
        id: "", //id set in firebase
        name: inputNameValue,
        date: inputDateValue,
        state: "New"
    }
    return taskObj
}

function clearTaskListEl(){
    taskList.innerHTML = ""
}

function clearInputFields(){
    taskNameEl.value = ""
    taskDateEl.value = ""
}

function appendItemToTaskListEl(item){
    let itemObject = item[1]

    let newEl = document.createElement("li")

    newEl.textContent = `Name: ${itemObject.name}, Date: ${itemObject.date}, Status: ${itemObject.state}`
    
    taskList.append(newEl)
 
}