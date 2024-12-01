const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/*const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jarrito1409',
    database: 'harry_potter_db',
});*/

const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Conexión a la base de datos
/*db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});*/

// Rutas
app.post('/personajes', (req, res) => {
    const { nombre, casa, descripcion, rol } = req.body;
    const query = 'INSERT INTO personajes (nombre, casa, descripcion, rol) VALUES (?, ?, ?, ?)';
    db.query(query, [id, nombre, casa, descripcion, rol], (err) => {
        if (err) return res.status(500).send({ message: 'Error al insertar personaje' });
        res.send({ message: 'Personaje insertado exitosamente' });
    });
});

app.get('/personajes', (req, res) => {
    const query = 'SELECT * FROM personajes';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send({ message: 'Error al obtener personajes' });
        res.send({ data: results });
    });
});

app.get('/personajes', (req, res) => {
    const { id } = req.query;

    // Si se proporciona un ID, se filtra por ese ID; de lo contrario, se devuelven todos los personajes.
    const query = id
        ? 'SELECT * FROM personajes WHERE id = ?'
        : 'SELECT * FROM personajes';

    const params = id ? [id] : []; // Parámetros de la consulta, solo se usa el ID si es necesario.

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error al obtener personajes' });
        }

        // Si no se encontró ningún resultado para el ID proporcionado
        if (id && results.length === 0) {
            return res.status(404).send({ message: 'Personaje no encontrado' });
        }

        res.send({ data: results });
    });
});

app.delete('/personajes', (req, res) => {
    const { id } = req.query; // Obtener el ID desde la query string
    if (!id) {
        return res.status(400).send({ message: 'El ID es obligatorio para eliminar un personaje' });
    }
    const query = 'DELETE FROM personajes WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error al eliminar personaje' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({ message: 'Personaje no encontrado' });
        }

        res.send({ status: 1, message: 'Personaje eliminado correctamente' });
    });
});

app.patch('/personajes/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID del personaje desde los parámetros de la ruta
    const { nombre, casa, descripcion, rol } = req.body; // Obtener los datos enviados en el cuerpo de la solicitud

    // Validar que se haya proporcionado un ID
    if (!id) {
        return res.status(400).send({ message: 'El ID es obligatorio para actualizar un personaje' });
    }

    // Construir la consulta SQL dinámica
    const fields = [];
    const values = [];

    if (nombre) {
        fields.push('nombre = ?');
        values.push(nombre);
    }
    if (casa) {
        fields.push('casa = ?');
        values.push(casa);
    }
    if (descripcion) {
        fields.push('descripcion = ?');
        values.push(descripcion);
    }
    if (rol) {
        fields.push('rol = ?');
        values.push(rol);
    }

    // Si no se envió ningún campo para actualizar
    if (fields.length === 0) {
        return res.status(400).send({ message: 'No se proporcionaron datos para actualizar' });
    }

    // Agregar el ID al final de los valores
    values.push(id);

    // Generar la consulta SQL dinámica
    const query = `UPDATE personajes SET ${fields.join(', ')} WHERE id = ?`;

    // Ejecutar la consulta
    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Error al actualizar el personaje' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).send({ message: 'Personaje no encontrado' });
        }

        res.send({ message: 'Personaje actualizado correctamente' });
    });
});

const PDFDocument = require('pdfkit');
const fs = require('fs');

app.post('/personajes/formato', (req, res) => {
    const { id, nombre, casa, descripcion, rol } = req.body;

    // Validar que todos los datos estén presentes
    if (!id || !nombre || !casa || !descripcion || !rol) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    // Crear un nuevo documento PDF
    const doc = new PDFDocument();

    // Configurar la respuesta HTTP para descargar el archivo
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=personaje_${id}.pdf`);

    // Escribir el contenido del PDF
    doc.pipe(res); // Enviar el PDF directamente a la respuesta
    doc.fontSize(20).text(`Ficha del Personaje`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`ID: ${id}`);
    doc.text(`Nombre: ${nombre}`);
    doc.text(`Casa: ${casa}`);
    doc.text(`Descripción: ${descripcion}`);
    doc.text(`Rol: ${rol}`);
    doc.end(); // Finalizar la escritura del PDF
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
