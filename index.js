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

app.get('/ping', async(req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tb_usuarios');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener datos de la tabla:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

//*********USUARIOS */
app.get('/usuarios', async(req, res) => {
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
app.get('/perfiluser/:idusuarios', async(req, res) => {
    const idusuario = req.params.idusuarios;

    try {
        const getPropertiesQuery = 'SELECT * FROM tb_usuarios WHERE idusuarios = $1';
        const properties = await pool.query(getPropertiesQuery, [idusuario]);

        return res.status(200).json(properties.rows);
    } catch (error) {
        console.error('Error retrieving properties:', error);
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
//**PRODUCTOS ********************/
app.get('/listaproductos', async(req, res) => {
    try {
        const getUsersQuery = 'SELECT * FROM tb_productos';
        const users = await pool.query(getUsersQuery);

        return res.status(200).json(users.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/registrarproducto', async(req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;

        const userExistQuery = 'SELECT * FROM tb_productos WHERE nombre = $1';
        const userExistValues = [nombre];
        const userExistResult = await pool.query(userExistQuery, userExistValues);

        if (userExistResult.rowCount > 0) {
            return res.status(400).json({ error: 'El producto ya esta registrado' });
        }

        const insertUserQuery = 'INSERT INTO tb_productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4)';
        const insertUserValues = [nombre, descripcion, precio, stock];
        await pool.query(insertUserQuery, insertUserValues);

        return res.status(201).json({ message: 'Registrado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }


});
// Obtener un producto por su ID
app.get('/producto/:idproducto', async(req, res) => {
    try {
        const productId = req.params.idproducto;
        const getProductQuery = 'SELECT * FROM tb_productos WHERE idproducto = $1';
        const product = await pool.query(getProductQuery, [productId]);

        if (product.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Editar un producto por su ID
app.put('/editarproducto/:idproducto', async(req, res) => {
    try {
        const productId = req.params.idproducto;
        const { nombre, descripcion, precio, stock } = req.body;

        const updateProductQuery = 'UPDATE tb_productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4 WHERE idproducto = $5';
        const updateProductValues = [nombre, descripcion, precio, stock, productId];
        await pool.query(updateProductQuery, updateProductValues);

        return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Eliminar un producto por su ID
app.delete('/eliminarproducto/:idproducto', async(req, res) => {
    try {
        const productId = req.params.idproducto;

        const deleteProductQuery = 'DELETE FROM tb_productos WHERE idproducto = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

//**MASCOTAS */
app.get('/listamascotas', async(req, res) => {
    try {
        const getMascotasQuery = `
        SELECT
        m.idmascota,
        m.nombre,
        m.especie,
        m.raza,
        m.edad,
        CONCAT(u.nombres, ' ', u.apellidos) AS nombre_completo
    FROM
        tb_mascotas m
    JOIN
        tb_usuarios u ON m.idusuarios = u.idusuarios    
        `;

        const mascotas = await pool.query(getMascotasQuery);

        return res.status(200).json(mascotas.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/registrarmascota', async(req, res) => {
    try {
        const { idusuarios, nombre, especie, raza, edad } = req.body;

        const insertMascotaQuery = 'INSERT INTO tb_mascotas (idusuarios, nombre, especie, raza, edad) VALUES ($1, $2, $3, $4, $5)';
        const insertMascotaValues = [idusuarios, nombre, especie, raza, edad];
        await pool.query(insertMascotaQuery, insertMascotaValues);

        return res.status(201).json({ message: 'Mascota registrada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.get('/mascota/:idmascota', async(req, res) => {
    try {
        const productId = req.params.idmascota;
        const getProductQuery = 'SELECT * FROM tb_mascotas WHERE idmascota = $1';
        const product = await pool.query(getProductQuery, [productId]);

        if (product.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.put('/editarmascota/:idmascota', async(req, res) => {
    try {
        const productId = req.params.idmascota;
        const { idusuarios, nombre, especie, raza, edad } = req.body;

        const updateProductQuery = 'UPDATE tb_mascotas SET idusuarios = $1, nombre = $2, especie = $3, raza = $4, edad = $5 WHERE idmascota = $6';
        const updateProductValues = [idusuarios, nombre, especie, raza, edad, productId];
        await pool.query(updateProductQuery, updateProductValues);

        return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.delete('/eliminarmascota/:idmascota', async(req, res) => {
    try {
        const productId = req.params.idmascota;

        const deleteProductQuery = 'DELETE FROM tb_mascotas WHERE idmascota = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
//**CITAS */
app.get('/listacitas', async(req, res) => {
    try {
        const getMascotasQuery = `
        SELECT
        m.idcita,
        m.fecha,
        m.hora,
        m.razoncita,
        m.observaciones,
        u.nombre
    FROM
        tb_citas m
    JOIN
        tb_mascotas u ON m.idmascota = u.idmascota
        `;

        const mascotas = await pool.query(getMascotasQuery);

        return res.status(200).json(mascotas.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.post('/registrarcitas', async(req, res) => {
    try {
        const { idmascota, fecha, hora, razoncita, observaciones } = req.body;

        const insertMascotaQuery = 'INSERT INTO tb_citas (idmascota, fecha, hora, razoncita, observaciones) VALUES ($1, $2, $3, $4, $5)';
        const insertMascotaValues = [idmascota, fecha, hora, razoncita, observaciones];
        await pool.query(insertMascotaQuery, insertMascotaValues);

        return res.status(201).json({ message: 'Cita registrada exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.get('/citas/:idcita', async(req, res) => {
    try {
        const productId = req.params.idcita;
        const getProductQuery = 'SELECT * FROM tb_citas WHERE idcita = $1';
        const product = await pool.query(getProductQuery, [productId]);

        if (product.rowCount === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        return res.status(200).json(product.rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.put('/editarcita/:idcita', async(req, res) => {
    try {
        const productId = req.params.idcita;
        const { idmascota, fecha, hora, razoncita, observaciones } = req.body;

        const updateProductQuery = 'UPDATE tb_citas SET idmascota = $1, fecha = $2, hora = $3, razoncita = $4, observaciones = $5 WHERE idcita = $6';
        const updateProductValues = [idmascota, fecha, hora, razoncita, observaciones, productId];
        await pool.query(updateProductQuery, updateProductValues);

        return res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
app.delete('/eliminarcita/:idcita', async(req, res) => {
    try {
        const productId = req.params.idcita;

        const deleteProductQuery = 'DELETE FROM tb_citas WHERE idcita = $1';
        await pool.query(deleteProductQuery, [productId]);

        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});
