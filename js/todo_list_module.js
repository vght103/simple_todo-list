(function () {
  todoModule = {
    start: function () {
      this.newTodoInput = document.querySelector(".new-todo");
      this.todoList = document.querySelector(".todo-list");
      this.toggleAll = document.querySelector(".toggle-all");
      this.footer = document.querySelector(".footer");

      // this.todosArray = [];

      const todosData = localStorage.getItem("todos");
      this.todosArray = JSON.parse(todosData) || [];
      console.log(this.todosArray);

      this.statrtAction();
      this.drawTodos();
    },

    drawTodos: function () {
      // localStorage에 있는 배열을 createTodo를 실행시킨다.
      const self = this;
      this.todosArray.forEach((todo) => {
        self.createTodo(todo);
      });
      self.todoCounting();
    },

    statrtAction: function (e) {
      const self = this;
      this.newTodoInput.addEventListener("keyup", function (e) {
        if (e.keyCode != 13) {
          return;
        }
        self.createAction();
      });

      const todoAll = this.footer.querySelector(".todo-all");
      todoAll.addEventListener("click", function (e) {
        self.showTodoAll(e);
        self.filterSelected(e);
        self.saveTodos();
      });

      const todoActive = this.footer.querySelector(".todo-active");
      todoActive.addEventListener("click", function (e) {
        self.showTodoActive(e);
        self.filterSelected(e);
        self.saveTodos();
      });

      const todoCompleted = this.footer.querySelector(".todo-completed");
      todoCompleted.addEventListener("click", function (e) {
        self.showTodoCompleted(e);
        self.filterSelected(e);
        self.saveTodos();
      });

      const todosClear = this.footer.querySelector(".todo-clear");
      todosClear.addEventListener("click", function (e) {
        self.clearTodos(e);
      });

      this.toggleAll.addEventListener("change", function () {
        self.todoAllCompleted();
        self.todoCounting();
      });
    },

    createAction: function () {
      const newTodoText = this.newTodoInput.value;
      if (!newTodoText) {
        return;
      }

      const todoObj = {
        id: new Date().getTime().toString(),
        text: newTodoText,
        completed: false,
      };

      this.todosArray.push(todoObj);
      this.createTodo(todoObj);
      this.todoCounting();
      this.saveTodos();

      this.newTodoInput.value = null;
    },

    createTodo: function (todoObj) {
      const self = this;
      const todoList = this.todoList;

      const todoItem = document.createElement("li");
      todoItem.dataset.todoId = todoObj.id;
      todoItem.classList = todoObj.completed ? "completed" : "";

      const viewDiv = document.createElement("div");
      viewDiv.classList = "view";

      const toggleBox = document.createElement("input");
      toggleBox.classList = "toggle";
      toggleBox.type = "checkbox";
      toggleBox.checked = todoObj.completed;

      toggleBox.addEventListener("change", function (e) {
        self.todoCompleted(e);
        self.todoAllControl(e);
        self.todoCounting(e);

        todoObj.completed = !todoObj.completed;
        console.log(todoObj.completed);

        self.saveTodos();
      });

      const label = document.createElement("label");
      label.innerText = todoObj.text;
      label.addEventListener("dblclick", function (e) {
        self.todoEditing(e);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.classList = "delete";
      deleteBtn.innerText = "❌";
      deleteBtn.addEventListener("click", function (e) {
        const todoItem = e.target.parentElement.parentElement;
        self.removeTodo(todoItem);
      });

      const editInput = document.createElement("input");
      editInput.classList = "edit";

      editInput.addEventListener("keyup", function (e) {
        if (e.keyCode != 13) {
          return;
        }
        self.editUpdated(e);
      });

      editInput.addEventListener("focusout", function (e) {
        // const todoItem = e.target.parentElement;
        // todoItem.classList.remove("editing");
        self.editUpdated(e);
      });

      todoList.appendChild(todoItem);
      todoItem.appendChild(viewDiv);
      todoItem.appendChild(editInput);
      viewDiv.appendChild(toggleBox);
      viewDiv.appendChild(label);
      viewDiv.appendChild(deleteBtn);
    },

    saveTodos: function () {
      // 1. localhost에 li 들을 저장하자.
      localStorage.setItem("todos", JSON.stringify(this.todosArray));
    },

    removeTodo: function (element) {
      // todosArray 에 있는 id 랑 element의 id랑 똑같으면 삭제

      const todoId = element.dataset.todoId;
      console.log(todoId);

      const todoIndex = this.todosArray.findIndex((todo) => todo.id == todoId);
      this.todosArray.splice(todoIndex, 1);

      element.remove();
      this.todoCounting();
      this.saveTodos();
    },

    todoCompleted: function (e) {
      // 클릭하면, list에 completed 클래스 생성
      const todoItem = e.target.parentElement.parentElement;
      todoItem.classList.toggle("completed");
    },

    todoAllControl: function () {
      // 리스트내에 모든 li 가 completed면 toggle all 활성화
      const todoItems = this.todoList.querySelectorAll("li");
      let allChecked = true;

      for (let i = 0; i < todoItems.length; i++) {
        const currentItem = todoItems[i];
        const toggleChkBox = currentItem.querySelector("div > input");

        if (!toggleChkBox.checked) {
          allChecked = false;
          break;
        }
      }
      this.toggleAll.checked = allChecked;
    },

    todoAllCompleted: function () {
      const todoItems = this.todoList.querySelectorAll("li");
      let allChecked = this.toggleAll.checked;
      console.log(allChecked);

      for (let i = 0; i < todoItems.length; i++) {
        const currentItem = todoItems[i];
        const toggleChkBox = currentItem.querySelector("div > input");

        toggleChkBox.checked = allChecked;

        if (allChecked) {
          currentItem.classList.add("completed");
        } else {
          currentItem.classList.remove("completed");
        }
        this.todosArray[i].completed = allChecked;
        console.log(this.todosArray[i]);
      }

      this.saveTodos();
    },

    todoEditing: function (e) {
      const todoItem = e.target.parentElement.parentElement;
      todoItem.classList = "editing";

      const label = e.target;
      const editInput = todoItem.querySelector(".edit");
      editInput.value = label.innerText;

      editInput.focus();
    },

    editUpdated: function (e) {
      const todoItem = e.target.parentElement;
      const editInput = e.target;
      const label = todoItem.querySelector("label");
      label.innerText = editInput.value;

      todoItem.classList.remove("editing");
    },

    todoCounting: function () {
      // active중인 li 갯수 나타내기
      // 전체 리스트를 가져오자.
      const todoItems = this.todoList.querySelectorAll("li");
      const counting = this.footer.querySelector(".todo-count");
      let leftItems = todoItems.length;

      // completed가 된건 active 제외
      for (let i = 0; i < todoItems.length; i++) {
        const currentItem = todoItems[i];
        const toggleBox = currentItem.querySelector(".toggle");

        if (toggleBox.checked) {
          leftItems -= 1;
        }
      }
      this.footer.style.display = todoItems.length == 0 ? "none" : "block";
      counting.innerText = leftItems + " left items";
    },

    showTodoAll: function () {
      const todoItems = this.todoList;
      todoItems.classList.remove("active");
      todoItems.classList.remove("completed");
    },

    showTodoActive: function () {
      // li 클래스가 completed가 아닌 것을 보여준다.

      const todoItems = this.todoList;
      todoItems.classList.add("active");
      todoItems.classList.remove("completed");
    },
    showTodoCompleted: function () {
      const todoItems = this.todoList;
      todoItems.classList.remove("active");
      todoItems.classList.add("completed");
    },

    filterSelected: function (e) {
      // 클릭시 selected 클래스 생성
      const filterBtns = this.footer.querySelectorAll("li");
      console.log(filterBtns.length);
      filterBtns.forEach((btn) => btn.classList.remove("selected"));

      e.target.classList.add("selected");
    },

    clearTodos: function () {
      const todoItems = this.todoList.querySelectorAll("li");
      console.log(todoItems);
      todoItems.forEach((todo) => {
        if (todo.classList == "completed") {
          this.removeTodo(todo);
        }
      });

      console.log(todoItems);
    },
  };

  window.todoStart = function () {
    todoModule.start();
  };
})();
