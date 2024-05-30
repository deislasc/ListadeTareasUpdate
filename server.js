const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();

// Middleware para analizar el cuerpo de las solicitudes JSON
app.use(express.json());

// Conectar a MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/todolist';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('No se pudo conectar a MongoDB', err));

// Configurar middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));  // Configurar Express para servir archivos estáticos desde 'public'
app.set('view engine', 'ejs');

// Modelo de datos
const Task = require('./task');

// Ruta principal
app.get('/', async (req, res) => {
  const tasks = await Task.find();
  res.render('index', { tasks });
});

// Crear tarea
app.post('/api/tasks/new', async (req, res) => {
  // Validar las fechas antes de guardarlas en la base de datos
  const startDate = moment(req.body.startDate);
  const endDate = moment(req.body.endDate);

  if (!startDate.isValid() || !endDate.isValid()) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }

  console.log('Datos recibidos para crear tarea:', req.body); // Agregado para depuración

  const task = new Task({
    name: req.body.name,
    completed: false,
    startDate: startDate.toDate(),
    endDate: endDate.toDate()
  });

  try {
    await task.save();
    console.log('Tarea creada correctamente'); // Agregar mensaje de éxito
    res.status(201).json({ message: 'Tarea creada correctamente', task }); // Devolver respuesta con la tarea creada
  } catch (error) {
    console.error('Error al guardar la tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor al guardar la tarea' });
  }
});

// Actualizar tarea (marcar como completada)
app.post('/api/tasks/:id/complete', async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (task) {
    task.completed = !task.completed;
    await task.save();
  }
  res.redirect('/');
});

// Eliminar tarea
app.post('/api/tasks/:id/delete', async (req, res) => {
  try {
    const result = await Task.findByIdAndDelete(req.params.id);
    if (result) {
      console.log('Elemento eliminado correctamente:', req.params.id);
      res.status(200).json({ message: 'Elemento eliminado correctamente' });
    } else {
      console.error('Tarea no encontrada para eliminar:', req.params.id);
      res.status(404).json({ error: 'Tarea no encontrada para eliminar' });
    }
  } catch (error) {
    console.error('Error al eliminar el elemento:', error);
    res.status(500).json({ error: 'Error al eliminar el elemento' });
  }
});

// Consultar todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener las tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Consultar una sola tarea por ID
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error al obtener tarea por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Editar tarea
app.put('/api/tasks/:id', async (req, res) => {
  // Validar las fechas antes de guardarlas en la base de datos
  const startDate = moment(req.body.startDate);
  const endDate = moment(req.body.endDate);

  if (!startDate.isValid() || !endDate.isValid()) {
    return res.status(400).json({ error: 'Formato de fecha inválido' });
  }

  try {
    const task = await Task.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      startDate: startDate.toDate(),
      endDate: endDate.toDate()
    }, { new: true });

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar la tarea' });
  }
});



// Definir el puerto
const port = 3000;
app.listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`));
