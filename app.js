const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Get Todo list API
app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;
  const getTodosQuery = `
    select * from todo 
    where status like '${status}%' and 
    priority like '${priority}%' and todo like "%${search_q}%";`;
  const todoList = await db.all(getTodosQuery);
  response.send(todoList);
});

//Get Todo API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    select * from todo where id = ${todoId};`;
  const todoTask = await db.get(getTodoQuery);
  response.send(todoTask);
});

//Add Todo Task API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addTodoQuery = `insert into todo(id,todo,priority,status)
    values(${id},'${todo}','${priority}','${status}');`;
  await db.run(addTodoQuery);
  response.send("Todo Successfully Added");
});

//Update Todo Task API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  const updateTodoQuery = `update todo set
  todo ='${todo}',
  priority = '${priority}',
  status ='${status}'
  where id = ${todoId};`;
  await db.run(updateTodoQuery);
  if (priority !== undefined) {
    response.send("Priority Updated");
  }
  if (status !== undefined) {
    response.send("Status Updated");
  }
  if (todo !== undefined) {
    response.send("Todo Updated");
  }
});

//Delete Todo API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    delete from todo where id =${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
