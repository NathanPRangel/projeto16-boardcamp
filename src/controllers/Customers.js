import { db } from "../database/database.js";

export async function getCustomers(req, res) {
  try {
    const customers = await db.query('SELECT * FROM customers;');
    res.send(customers.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function getCustomersById(req, res) {
  const id = res.locals.id;

  try {
    const customer = await db.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (customer.rows.length === 0) {
      return res.sendStatus(404);
    }

    const formattedCustomer = {
      ...customer.rows[0],
      birthday: customer.rows[0].birthday.toISOString().split('T')[0],
    };

    res.send(formattedCustomer);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function postCustomers(req, res) {
  const customer = res.locals.customer;

  try {
    await db.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);', [customer.name, customer.phone, customer.cpf, customer.birthday]);

    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function putCustomers(req, res) {
  const { id, customer } = res.locals;

  try {
    const customerChanges = await db.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (customerChanges.rows.length === 0) {
      return res.sendStatus(404);
    }

    if (customerChanges.rows[0].name !== customer.name) {
      await db.query('UPDATE customers SET name = $1 WHERE id = $2;', [customer.name, id]);
    }

    if (customerChanges.rows[0].phone !== customer.phone) {
      await db.query('UPDATE customers SET phone = $1 WHERE id = $2;', [customer.phone, id]);
    }

    const formattedBirthday = customer.birthday.toISOString().split('T')[0];
    if (customerChanges.rows[0].birthday !== formattedBirthday) {
      await db.query('UPDATE customers SET birthday = $1 WHERE id = $2;', [formattedBirthday, id]);
    }

    if (customerChanges.rows[0].cpf !== customer.cpf) {
      const cpfExist = await db.query('SELECT * FROM customers WHERE cpf = $1;', [customer.cpf]);

      if (cpfExist.rows.length > 0) {
        return res.sendStatus(409);
      }

      await db.query('UPDATE customers SET cpf = $1 WHERE id = $2;', [customer.cpf, id]);
    }

    return res.sendStatus(200); 
  } catch (error) {
    console.log(error);
    return res.sendStatus(500); 
  }
}
