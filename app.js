const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//API 1:1
app.get('/todos/', async (request, response) => {
  const {status, search_q = '', priority} = request.query
  let getAlltodos
  switch (true) {
    case status !== undefined && priority !== undefined:
      getAlltodos = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status ="%${status}%" AND priority ="%${priority}%";`
      break
    case priority !== undefined:
      getAlltodos = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND priority="%${priority}%";`
      break
    case status !== undefined:
      getAlltodos = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%" AND status="%${status}%";`
      break
    case search_q !== undefined:
      getAlltodos = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`
      break
  }
  const getALl = await db.all(getAlltodos)
  response.send(getALl)
})

//API 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getIdquery = `SELECT * FROM todo WHERE id = ${todoId};`
  const getId = await db.get(getIdquery)
  response.send(getId)
})

//API 3

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const getADDtodoQuery = ` INSERT INTO todo (id,todo,priority,status)
  VALUES(${id},"${todo}","${priority}","${status}");
  `
  await db.run(getADDtodoQuery)
  response.send('Todo Successfully Added')
})

//API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const previousTodo = await database.get(previousTodoQuery)
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}' WHERE id = ${todoId};`
  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

//api 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletequery = ` DELETE FROM todo WHERE id=${todoId};`
  await db.run(deletequery)
  response.send('Todo Deleted')
})

module.exports = app
