const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.filter((user) => {
    return user.username === username;
  })

  if (!user.length != 0) return response.status(400).json({ error: "User does not exists!" })

  request.user = user[0];
  next()
}

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  if (!name && !username) response.status(400).json({ error: "Invalid request" })

  const user = users.filter((user) => {
    return user.username == username;
  })

  if (user.length != 0) return response.status(400).json({ error: "Username already taken!" })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(newUser);

  return response.status(201).json({ ...newUser })

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  if (!title && !deadline) response.status(400).json({ error: "Invalid request" })

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users.forEach((it, index) => {
    if (user.username === it.username) {
      users[index].todos.push(newTodo)
    }
  })

  return response.status(201).json({ ...newTodo })
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  let editedTodo

  if (!title && !deadline && !id) response.status(400).json({ error: "Invalid request" })

  users.forEach((it, userIndex) => {
    if (user.username === it.username) {
      users[userIndex].todos.forEach((todo, todoIndex) => {
        if (id === todo.id) {
          users[userIndex].todos[todoIndex] = { ...todo, title, deadline }
          editedTodo = { ...todo, title, deadline }
        }
      })
    }
  })

  if (!editedTodo) response.status(404).json({ error: "Todo not found" })

  return response.status(200).json({ ...editedTodo })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  let editedTodo

  if (!id) response.status(400).json({ error: "Invalid request" })

  users.forEach((it, userIndex) => {
    if (user.username === it.username) {
      users[userIndex].todos.forEach((todo, todoIndex) => {
        if (id === todo.id) {
          users[userIndex].todos[todoIndex] = { ...todo, done: true }
          editedTodo = { ...todo, done: true }
        }
      })
    }
  })

  if (!editedTodo) response.status(404).json({ error: "Todo not found" })

  return response.status(200).json({ ...editedTodo })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  if (!id) response.status(400).json({ error: "Invalid request" })

  let isTodoFound

  console.log(users)

  users.forEach((it, userIndex) => {
    if (user.username === it.username) {
      users[userIndex].todos.forEach((todo, todoIndex) => {
        if (id === todo.id) {
          isTodoFound = true
          users[userIndex].todos.splice(todoIndex, 1)
        }
      })
    }
  })

  console.log(users)

  if (!isTodoFound) response.status(404).json({ error: "Todo not found" })

  return response.status(204).json({})

});

module.exports = app;