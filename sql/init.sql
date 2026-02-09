-- =========================
-- TABLE: users
-- =========================
CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL
);

INSERT INTO users (id, name, email, password) VALUES
    (
        '410544b2-4001-4271-9855-fec4b6a6442a',
        'User',
        'user@nextmail.com',
        '123456'
    );

-- =========================
-- TABLE: customers
-- =========================
CREATE TABLE customers (
                           id UUID PRIMARY KEY,
                           name VARCHAR(150) NOT NULL,
                           email VARCHAR(255) NOT NULL UNIQUE,
                           image_url VARCHAR(255)
);

INSERT INTO customers (id, name, email, image_url) VALUES
                                                       ('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa', 'Evil Rabbit', 'evil@rabbit.com', '/customers/evil-rabbit.png'),
                                                       ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 'Delba de Oliveira', 'delba@oliveira.com', '/customers/delba-de-oliveira.png'),
                                                       ('3958dc9e-742f-4377-85e9-fec4b6a6442a', 'Lee Robinson', 'lee@robinson.com', '/customers/lee-robinson.png'),
                                                       ('76d65c26-f784-44a2-ac19-586678f7c2f2', 'Michael Novotny', 'michael@novotny.com', '/customers/michael-novotny.png'),
                                                       ('cc27c14a-0acf-4f4a-a6c9-d45682c144b9', 'Amy Burns', 'amy@burns.com', '/customers/amy-burns.png'),
                                                       ('13d07535-c59e-4157-a011-f8d2ef4e0cbb', 'Balazs Orban', 'balazs@orban.com', '/customers/balazs-orban.png');

-- =========================
-- TABLE: invoices
-- =========================
CREATE TABLE invoices (
                          id SERIAL PRIMARY KEY,
                          customer_id UUID NOT NULL,
                          amount INTEGER NOT NULL,
                          status VARCHAR(20) CHECK (status IN ('paid', 'pending')),
                          date DATE NOT NULL,
                          CONSTRAINT fk_customer
                              FOREIGN KEY (customer_id)
                                  REFERENCES customers(id)
                                  ON DELETE CASCADE
);

INSERT INTO invoices (customer_id, amount, status, date) VALUES
                                                             ('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa', 15795, 'pending', '2022-12-06'),
                                                             ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 20348, 'pending', '2022-11-14'),
                                                             ('cc27c14a-0acf-4f4a-a6c9-d45682c144b9', 3040, 'paid', '2022-10-29'),
                                                             ('76d65c26-f784-44a2-ac19-586678f7c2f2', 44800, 'paid', '2023-09-10'),
                                                             ('13d07535-c59e-4157-a011-f8d2ef4e0cbb', 34577, 'pending', '2023-08-05'),
                                                             ('3958dc9e-742f-4377-85e9-fec4b6a6442a', 54246, 'pending', '2023-07-16'),
                                                             ('d6e15727-9fe1-4961-8c5b-ea44a9bd81aa', 666, 'pending', '2023-06-27'),
                                                             ('76d65c26-f784-44a2-ac19-586678f7c2f2', 32545, 'paid', '2023-06-09'),
                                                             ('cc27c14a-0acf-4f4a-a6c9-d45682c144b9', 1250, 'paid', '2023-06-17'),
                                                             ('13d07535-c59e-4157-a011-f8d2ef4e0cbb', 8546, 'paid', '2023-06-07'),
                                                             ('3958dc9e-712f-4377-85e9-fec4b6a6442a', 500, 'paid', '2023-08-19'),
                                                             ('13d07535-c59e-4157-a011-f8d2ef4e0cbb', 8945, 'paid', '2023-06-03'),
                                                             ('3958dc9e-742f-4377-85e9-fec4b6a6442a', 1000, 'paid', '2022-06-05');

-- =========================
-- TABLE: revenue
-- =========================
CREATE TABLE revenue (
                         month VARCHAR(3) PRIMARY KEY,
                         revenue INTEGER NOT NULL
);

INSERT INTO revenue (month, revenue) VALUES
                                         ('Jan', 2000),
                                         ('Feb', 1800),
                                         ('Mar', 2200),
                                         ('Apr', 2500),
                                         ('May', 2300),
                                         ('Jun', 3200),
                                         ('Jul', 3500),
                                         ('Aug', 3700),
                                         ('Sep', 2500),
                                         ('Oct', 2800),
                                         ('Nov', 3000),
                                         ('Dec', 4800);
