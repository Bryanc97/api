import express from 'express'
import { config } from 'dotenv'
import pg from 'pg'
import cors from 'cors';

config()

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = 'https://shyest-economies.000webhostapp.com';
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());


const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

app.get('/', (req, res) => {
    res.send('Hola mundo')
})

app.get('/ping', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tb_usuarios');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de la tabla:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});


app.get('/usuarios', async (req, res) => {
    try {
        const getUsersQuery = 'SELECT * FROM tb_usuarios';
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        const loginQuery = 'SELECT * FROM tb_usuarios WHERE email = $1 AND password = $2';
        const loginValues = [email, password];
        const loginResult = await pool.query(loginQuery, loginValues);

        if (loginResult.rowCount === 1) {
            // Usuario autenticado con éxito
            const user = loginResult.rows[0];
            const { password, ...userData } = user; // Excluye la contraseña de los datos del usuario
            return res.status(200).json({ message: 'Inicio de sesión exitoso', user: userData, userId: user.id });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/register', async(req, res) => {
    try {
        const { cedula, nombres, apellidos, telefono, email, password, tipo } = req.body;

        const userExistQuery = 'SELECT * FROM tb_usuarios WHERE email = $1 OR cedula = $2';
        const userExistValues = [email, cedula];
        const userExistResult = await pool.query(userExistQuery, userExistValues);

        if (userExistResult.rowCount > 0) {
            return res.status(400).json({ error: 'El email ya esta registrado' });
        }

        const insertUserQuery = 'INSERT INTO tb_usuarios (cedula, nombres, apellidos, telefono, email, password,tipo) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const insertUserValues = [cedula, nombres, apellidos, telefono, email, password, tipo];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/obtenerTipoUsuario', async(req, res) => {
    try {
        const { email } = req.body;

        const obtenerTipoUsuarioQuery = 'SELECT tipo FROM tb_usuarios WHERE email = $1';
        const obtenerTipoUsuarioValues = [email];
        const tipoUsuarioResult = await pool.query(obtenerTipoUsuarioQuery, obtenerTipoUsuarioValues);

        if (tipoUsuarioResult.rowCount > 0) {
            const tipoUsuario = tipoUsuarioResult.rows[0].tipo;
            return res.status(200).json({ tipo: tipoUsuario });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.post('/obtenerIdUsuario', async(req, res) => {
    try {
        const { email } = req.body;
        const obtenerIdUsuarioQuery = 'SELECT idusuarios FROM tb_usuarios WHERE email = $1';
        const obtenerIdUsuarioValues = [email];

        const IdUsuarioResult = await pool.query(obtenerIdUsuarioQuery, obtenerIdUsuarioValues);

        if (IdUsuarioResult.rowCount > 0) {
            const idusuarios = IdUsuarioResult.rows[0].idusuarios;
            return res.status(200).json({ idusuarios: idusuarios });
        } else {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.listen(port, () => {
    console.log(`Servidor en ejecución en http://localhost:${port}`);
});
