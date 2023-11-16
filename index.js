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

const filterDateBtn = document.getElementById("filterDate-btn")
const filterStateBtn = document.getElementById("filterState-btn")

const filterStateInput = document.getElementById("filter-input")
const undoFiletBtn = document.getElementById("undoFilter-btn")


let itemsArray = [] 
let undoFilterArray = [] //saves initial order of tasks to undo filter when needed

addItemBtn.addEventListener("click", function() {

    if(taskNameEl.value === "" || taskDateEl.value === ""){
        alert("Both fields must contain values!")
        return
    }

    let inputNameValue = taskNameEl.value
    let inputDateValue = taskDateEl.value

    //create Object and push to Database
    let newTask = taskToObject(inputNameValue, inputDateValue)

    let taskIDinDB = push(toDoListInDB, newTask).key

    newTask.id = taskIDinDB

    //set ID value in firebase
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

        itemsArray = Object.entries(snapshot.val())

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

    // create div containing a task
    const newTask = document.createElement("li")
    newTask.classList.add('task')
    newTask.setAttribute("id", itemID);

    // create div containing all input fields
    const taskContent = document.createElement('div')
    taskContent.classList.add('content')

    newTask.appendChild(taskContent)

    const taskNameInput = createInputField(taskContent, itemObject.name, itemID, "_name", 'name')
    const taskDateInput = createInputField(taskContent, itemObject.date, itemID, "_date",'date')
    const taskStateInput = createInputField(taskContent, itemObject.state, itemID, "_state", 'state')

    taskStateInput.addEventListener("click", function(){

        cycleStateValue(taskStateInput)
        
        set(ref(database, 'toDoList/'+ itemID ), {
            id: itemID,
            name: taskNameInput.value,
            date: taskDateInput.value,
            state: taskStateInput.value
        });
        
    })

    // create div containing the delete and edit buttons
    const actionEL = document.createElement("div")
    actionEL.classList.add('action-btn')

    const editBtnEl = createActionButton("edit", itemID+"_edit", "EDIT")
    const deleteBtnEl = createActionButton("delete", itemID+"_delete", "DELETE")

    // apply logik to delete and edit buttons
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

    // append HTML with the new Elements
    taskList.appendChild(newTask)

    actionEL.appendChild(editBtnEl)
    actionEL.appendChild(deleteBtnEl)

    newTask.appendChild(actionEL)
 
}

function createInputField(taskContent, inputValue, id, typeForID, classValue){
    const task_input_el = document.createElement('input');
	task_input_el.classList.add("'"+classValue+"'");
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



filterDateBtn.addEventListener("click", function() {
    undoFilterArray = itemsArray

    let sortedArray = [...itemsArray].sort((a,b) => (new Date(a[1].date)) - (new Date(b[1].date)))

    clearTaskListEl()

    for (let i = 0; i < sortedArray.length; i++) {
        let currentItem = sortedArray[i]

        appendItemToTaskListEl(currentItem)
    }

})

filterStateBtn.addEventListener("click", function() {
    undoFilterArray = itemsArray

    let sortedArray = [...itemsArray]

   for(let i=0;i<sortedArray.length;i++){
        if(sortedArray[i][1].state != filterStateInput.value){
            sortedArray.splice(i,1)   
            i--         
        }
   }

   clearTaskListEl()

    for (let i = 0; i < sortedArray.length; i++) {
        let currentItem = sortedArray[i]

        appendItemToTaskListEl(currentItem)
    }   
})

filterStateInput.addEventListener("click", function(){
    cycleStateValue(filterStateInput)
})

function cycleStateValue(givenField){
    let currtentVal = givenField.value

        switch(currtentVal) {
            case "New":
                givenField.value = "Active"
              break;
            case "Active":
                givenField.value = "Closed"
              break;
            case "Closed":
                givenField.value = "New"
              break;
            default:
                break;
        }
}

undoFiletBtn.addEventListener("click", function(){
    clearTaskListEl()

    for (let i = 0; i < itemsArray.length; i++) {
        let currentItem = itemsArray[i]

        appendItemToTaskListEl(currentItem)
    }
})