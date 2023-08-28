const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dateFns = require("date-fns");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1
app.get("/todos/", async (req, res) => {
  const { status, priority, category, search_q } = req.query;
  if (
    status !== "IN PROGRESS" &&
    status !== "TO DO" &&
    status !== "DONE" &&
    status !== undefined
  ) {
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (
    priority === undefined &&
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (priority !== undefined && status !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where priority = '${priority}' and 
        status = '${status}'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  } else if (search_q !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where todo like '%${search_q}%'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  } else if (
    category !== undefined &&
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    res.status(400);
    res.send("Invalid Todo Category");
  } else if (category !== undefined && status !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where category = '${category}' and 
        status = '${status}'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  } else if (category !== undefined && priority !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where category = '${category}' and 
        priority = '${priority}'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  } else if (priority !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where priority = '${priority}'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  } else if (category !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where category = '${category}'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  } else if (status !== undefined) {
    const getQuery = `
        select id, todo, priority, status,
        category, due_date as dueDate
        from todo
        where status = '${status}'
    ;`;
    const object = await db.all(getQuery);
    res.send(object);
  }
});

//API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `
            select 
            id, todo, priority, status,
            category, due_date as dueDate
        from todo
        where id = '${todoId}'
      ;`;
  const object = await db.get(query);
  res.send(object);
});

// API 3
app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  console.log(date);
  const formattedDate = dateFns.format(new Date(date), "yyyy-MM-dd");
  console.log(formattedDate);
  const query = `
            select 
                id, todo, priority, status,
                category, due_date as dueDate
            from todo
            where due_date = '${formattedDate}'
    ;`;
  const object = await db.get(query);
  console.log(object);
  res.send(object);
});

//API 4
app.post("/todos/", async (req, res) => {
  const { id, todo, status, priority, category, dueDate } = req.body;
  const insertQuery = `
       Insert into todo (id, todo, priority, status, category, due_date)
       values ('${id}', '${todo}','${priority}','${status}','${category}', '${dueDate}') 
    ;`;
  await db.run(insertQuery);
  res.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { status, priority, todo, category, dueDate } = req.body;
  if (status !== undefined) {
    const updateQuery = `
            update todo 
            set status = '${status}'
            where 
            id = '${todoId}'
        ;`;
    await db.run(updateQuery);
    res.send("Status Updated");
  } else if (priority !== undefined) {
    const updateQuery = `
            update todo 
            set priority = '${priority}'
            where 
            id = '${todoId}'
        ;`;
    await db.run(updateQuery);
    res.send("Priority Updated");
  } else if (category !== undefined) {
    const updateQuery = `
            update todo 
            set category = '${category}'
            where 
            id = '${todoId}'
        ;`;
    await db.run(updateQuery);
    res.send("Category Updated");
  } else if (todo !== undefined) {
    const updateQuery = `
            update todo 
            set todo = '${todo}'
            where 
            id = '${todoId}'
        ;`;
    await db.run(updateQuery);
    res.send("Todo Updated");
  } else if (dueDate !== undefined) {
    const updateQuery = `
            update todo 
            set due_date = '${dueDate}'
            where 
            id = '${todoId}'
        ;`;
    await db.run(updateQuery);
    res.send("Due Date Updated");
  }
});

//API 6
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteQuery = `
            delete from todo 
            where id = '${todoId}'
        ;`;
  await db.run(deleteQuery);
  res.send("Todo Deleted");
});

module.exports = app;
