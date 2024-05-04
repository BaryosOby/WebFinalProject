window.addEventListener("DOMContentLoaded", async () => {
  // grab all elements
  const form = document.querySelector("[data-form]");
  const lists = document.querySelector("[data-lists]");
  const input = document.querySelector("[data-input]");
  const logoutButton = document.getElementById("logoutButton");

  //--keep array Global for UI variable for UI Display
  let todoArr = [];

  ///--ToDo Class: Each Visual Element Should be
  //--related to ToDO Object
  class Todo {
    constructor(id, todo) {
      this.id = id;
      this.todo = todo;
    }

    setId(id) {
      this.id = id;
    }

    setTodo(todo) {
      this.todo = todo;
    }
  }

  //--Class To handle Storage Operations
  //-- Of todo array
  class Storage {
    //Get Array Of Class Objects
    static addTodStorage(todoArr) {
      let storage = localStorage.setItem("todo", JSON.stringify(todoArr));
      return storage;
    }

    //Get From Storage By Key
    static getStorage() {
      let storage =
        localStorage.getItem("todo") === null
          ? []
          : JSON.parse(localStorage.getItem("todo"));
      return storage;
    }
  }

  //Handle UI Operation
  class UI {
    //--Go Over All Array Elements
    //--And Generate HTML Items Dynamically
    static displayData() {
      //-Generate Html
      //-each Delete Icon Injected with
      //--data-id = {id of the object}
      let display_data = todoArr.map((item) => {
        console.log(item);
        return `
                    <div class="todo">
                    <p>${item.todo}</p>
                    <span class="remove" data-id="${item.id}">🗑️</span>
                    </div>
                `;
      });
      //--Put generated html in a container
      lists.innerHTML = display_data.join(" ");
    }
    static displayDataNew(data) {
      console.log(data);
      let display_data = data.map((item) => {
        console.log(item);
        return `
                        <div class="todo">
                        <p>${item.todo}</p>
                        <span class="remove" data-id="${item.id}">🗑️</span>
                        </div>
                    `;
      });
      //--Put generated html in a container
      lists.innerHTML = display_data.join(" ");
    }
    //--Remove Element When Clicked
    static registerRemoveTodo() {
      //--Register Click  For Deleting a toto row
      //--The Click is on the List Div Container
      lists.addEventListener("click", async (e) => {
        if (e.target.classList.contains("remove")) {
          //Get Id of clicked delete
          let btnId = e.target.dataset.id;
          //--Remove Element From HTML DOM
          //remove from array.
          await UI.removeArrayTodo(btnId, e.target);
        }
      });
    }

    //Remove Element From UI And Update LocalStorage
    static async removeArrayTodo(id, elementClicked) {
      const todoId = id; // Store the todo ID
      elementClicked.parentElement.remove();
      todoArr = todoArr.filter((item) => item.id !== id);
      console.log(todoArr, "first click");
      try {
        console.log("here before respopnse");
        const response = await fetch(`/todos/${todoId}?email=${email}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete todo item");
        }
      } catch (error) {
        console.error("Error deleting todo item:", error);
      }
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  if (email) {
    const userInfo = await fetchUserInfo(email);
    if (userInfo) {
      document.getElementById("user-name").textContent = userInfo.name;
      document.getElementById("user-email").textContent = userInfo.email;
      //   const userTodos = await fetchUserTodos(email);
      //   console.log("Fetched todos:", userTodos); // Add this line for debugging

      const userTodos = userInfo.todos?.map((item) => {
        return {
          todo: item.text,
          id: item.id,
        };
      });
      if (userTodos) {
        todoArr = userTodos;
        UI.displayDataNew(userTodos);
        UI.registerRemoveTodo();
      }
    } else {
      document.getElementById("user-name").textContent = "Unknown";
      document.getElementById("user-email").textContent = "Unknown";
    }
  }

  //Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const todoContent = input.value; // Store the input value

    input.value = ""; // Clear the input field
    const response = await fetch("/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, todo: todoContent }), // Send the stored value
    });
    const data = await response.json();
    console.log(data);
    const todo = new Todo(data.id, todoContent);
    todoArr = [...todoArr, todo];
    UI.displayData();
  });

  //Logout functionality
  logoutButton.addEventListener("click", async () => {
    // Send a request to log out the user
    const response = await fetch("/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      window.location.href = "/login";
    }
  });

  // Function to fetch user information from the server
  async function fetchUserInfo(email) {
    try {
      // Make a request to your Node.js server to fetch user information by email
      const response = await fetch(`/getUserInfo?email=${email}`);
      if (response.ok) {
        const userInfo = await response.json();
        console.log("user info found", userInfo);
        return userInfo;
      } else {
        console.error("Failed to fetch user information");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user information:", error);
      return null;
    }
  }

});
