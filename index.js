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

    //set value in firebase
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

    let itemID = itemObject.id

    // create div containing all tasks
    const newTask = document.createElement("div")
    newTask.classList.add('task')
    newTask.setAttribute("id", itemID);

    const taskContent = document.createElement('div')
    taskContent.classList.add('content')

    newTask.appendChild(taskContent)

    const taskNameInput = createInputField(taskContent, itemObject.name, itemID, "_name")
    const taskDateInput = createInputField(taskContent, itemObject.date, itemID, "_date")
    const taskStateInput = createInputField(taskContent, itemObject.state, itemID, "_state")

    const actionEL = document.createElement("div")
    actionEL.classList.add('action-btn')

    const editBtnEl = createActionButton("edit", itemID+"_edit", "EDIT")
    const deleteBtnEl = createActionButton("delete", itemID+"_delete", "DELETE")


    editBtnEl.addEventListener("click", function() {
        if (editBtnEl.innerText.toLowerCase() == "edit") {

            editBtnEl.innerText = "SAVE";
            taskNameInput.removeAttribute("readonly")
            taskDateInput.removeAttribute("readonly");
            taskStateInput.removeAttribute("readonly")
            taskNameInput.focus();

        } else {
            editBtnEl.innerText = "EDIT";
            taskNameInput.setAttribute("readonly", "readonly");
            taskDateInput.setAttribute("readonly", "readonly");
            taskStateInput.setAttribute("readonly", "readonly");

            set(ref(database, 'toDoList/'+ itemID ), {
                id: itemID,
                name: taskNameInput.value,
                date: taskDateInput.value,
                state: taskStateInput.value
            });
        }
    })
   
    deleteBtnEl.addEventListener("click", function(){
        let exactLocationOfItemInDB = ref(database,`toDoList/${itemID}`)
        remove(exactLocationOfItemInDB)
    })
    taskList.appendChild(newTask)

    actionEL.appendChild(editBtnEl)
    actionEL.appendChild(deleteBtnEl)

    newTask.appendChild(actionEL)
 
}

function createInputField(taskContent, inputValue, id, typeForID){
    const task_input_el = document.createElement('input');
	task_input_el.classList.add('text');
    task_input_el.setAttribute("id", id + typeForID )
	task_input_el.type = 'text';
	task_input_el.value = inputValue;
	task_input_el.setAttribute('readonly', 'readonly');

    taskContent.appendChild(task_input_el)

    return task_input_el
}

function createActionButton(btnClass, id, text){
    const new_Btn_El = document.createElement('button')
    new_Btn_El.classList.add(btnClass)
    new_Btn_El.setAttribute("id", id)
    new_Btn_El.innerHTML= text

    return new_Btn_El
}

