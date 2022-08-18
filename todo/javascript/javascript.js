class Model {
  constructor() {
    this.todos = [];
    this.filter = 0;
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  _commit(todos = this.todos) {
    this.onTodoListChanged(
      todos.filter((todo) => {
        if (this.filter === 0) return true;
        return this.filter === 1 ? todo.completed : !todo.completed;
      })
    );
  }

  addTodo(todoText) {
    const todo = {
      id: Date.now(),
      text: todoText,
      complete: false,
    };

    this.todos.push(todo);

    this._commit(this.todos);
  }

  removeTodo(todoId) {
    this.todos = this.todos.filter((todo) => todo.id !== todoId);

    this._commit(this.todos);
  }

  editToggleCheckbox(todoId) {
    this.todos = this.todos.map((item) =>
      item.id === todoId ? { ...item, completed: !item.completed } : item
    );

    this._commit(this.todos);
  }
  filteredTodo(selectedOptionValue) {
    this.filter = selectedOptionValue;
    this._commit();
  }
}

class View {
  constructor() {
    this.app = this.getElement("#root");
    this.form = this.createElement("form");
    this.header = this.createElement("header", "header");
    this.inputSearch = this.createElement("input", "input__search");
    this.input = this.createElement("input", "form__input");
    this.todoList = this.createElement("ul", "lists");
    this.select = this.createElement("select", "select__filter");
    this.buttonAdd = this.createElement("button", "form__button");
    this.title = this.createElement("h1", "title");

    this.options = [
      { value: 0, text: "All" },
      { value: 1, text: "Completed" },
    ];

    for (let i = 0; i < this.options.length; i++) {
      const opt = this.createElement("option");
      opt.value = this.options[i].value;
      opt.innerHTML = this.options[i].text;
      this.select.appendChild(opt);
    }

    this.buttonAdd.textContent = "Добавить";

    this.input.placeholder = "add todo";
    this.input.type = "text";
    this.inputSearch.placeholder = "search todo";
    this.inputSearch.type = "text";
    this.title.textContent = "Todos App";

    this.form.append(this.input, this.buttonAdd);
    this.header.append(this.title, this.select, this.inputSearch);
    this.app.append(this.header, this.form, this.todoList);
  }

  get _todoText() {
    return this.input.value;
  }

  get _inputSearchValue() {
    return this.inputSearch.value;
  }

  _resetInput() {
    this.input.value = "";
  }

  renderTodo(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild);
    }

    if (!todos.length) {
      const p = this.createElement("p", "title__hint");
      p.textContent = "Not Todos!";
      this.todoList.append(p);
    } else {
      todos.map((item) => {
        const li = this.createElement("li", "list");
        const span = this.createElement("span");
        const checkbox = this.createElement("input");
        const buttonDelete = this.createElement("button", "list__button");

        checkbox.type = "checkbox";
        checkbox.checked = item.completed;
        buttonDelete.textContent = "Удалить";

        span.contentEditable = true;
        li.id = item.id;

        if (item.completed) {
          const strike = this.createElement("s");
          strike.textContent = item.text;
          span.append(strike);
        } else {
          span.textContent = item.text;
        }
        li.append(checkbox, span, buttonDelete);
        this.todoList.append(li);
      });
    }
  }

  bindAddTodo(handler) {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (this._todoText) {
        handler(this._todoText);
        this._resetInput();
      }
    });
  }

  bindRemoveTodo(handler) {
    this.todoList.addEventListener("click", () => {
      if (event.target.className === "list__button") {
        const id = parseInt(event.target.parentElement.id);
        handler(id);
      }
    });
  }

  bindToggleCheckbox(hander) {
    this.todoList.addEventListener("change", (event) => {
      if ((event.target.type = "checkbox")) {
        const selectedId = parseInt(event.target.parentElement.id);
        hander(selectedId);
      }
    });
  }

  bindFilterTodo(handler) {
    this.select.addEventListener("click", (e) => {
      const selectedOption =
        +this.select.options[this.select.selectedIndex].value;
      handler(selectedOption);
    });
  }

  getElement(selector) {
    const element = document.querySelector(selector);

    return element;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);

    if (className) element.classList.add(className);

    return element;
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTodoListChanged(this.onTodoListChanged);
    this.view.bindAddTodo(this.handleAddTodo);
    this.view.bindRemoveTodo(this.handleRemoveTodo);
    this.view.bindToggleCheckbox(this.handleEditToggle);
    this.view.bindFilterTodo(this.handleFilteredTodo);
    this.onTodoListChanged(this.model.todos);
  }

  onTodoListChanged = (todos) => {
    this.view.renderTodo(todos);
  };

  handleAddTodo = (todoText) => {
    this.model.addTodo(todoText);
  };

  handleRemoveTodo = (todoId) => {
    this.model.removeTodo(todoId);
  };

  handleEditToggle = (todoId) => {
    this.model.editToggleCheckbox(todoId);
  };

  handleFilteredTodo = (selectedOptionValue) => {
    this.model.filteredTodo(selectedOptionValue);
  };
}

const app = new Controller(new Model(), new View());
