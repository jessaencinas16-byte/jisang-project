CREATE DATABASE IF NOT EXISTS brewpos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE brewpos;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS category_ingredients;
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;




CREATE TABLE categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO categories (id, name, sort_order) VALUES
(1,  'Coffee',      1),
(2,  'Espresso',    2),
(3,  'Latte',       3),
(4,  'Cappuccino',  4),
(5,  'Mocha',       5),
(6,  'Milk Tea',    6),
(7,  'Frappes',     7),
(8,  'Smoothies',   8),
(9,  'Pastries',    9),
(10, 'Cakes',       10),
(11, 'Sandwiches',  11);






CREATE TABLE products (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    category_id   INT NOT NULL,
    name          VARCHAR(100) NOT NULL,
    base_price    DECIMAL(8,2) NOT NULL,
    emoji         VARCHAR(10) DEFAULT NULL,
    img_url       TEXT DEFAULT NULL,
    is_popular    TINYINT(1) NOT NULL DEFAULT 0,
    is_new        TINYINT(1) NOT NULL DEFAULT 0,
    is_available  TINYINT(1) NOT NULL DEFAULT 1,
    description   TEXT DEFAULT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO products (id, category_id, name, base_price, emoji, img_url, is_popular, is_new, is_available, description) VALUES

(1,  1, 'Classic Brew',            80.00, '☕', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Slow-brewed house blend'),
(2,  1, 'Barako Strong',           95.00, '🫘', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Bold Filipino Barako beans'),
(3,  1, 'Americano',               85.00, '🥃', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&auto=format&q=80', 0, 1, 1, 'Espresso + hot water'),

(4,  2, 'Espresso Shot',           70.00, '⚡', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Double shot, intense'),
(5,  2, 'Espresso Macchiato',      90.00, '☕', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Espresso with milk foam'),
(6,  2, 'Affogato',               120.00, '🍨', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 0, 'Espresso over vanilla gelato'),

(7,  3, 'Classic Latte',          110.00, '🥛', 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Smooth & creamy'),
(8,  3, 'Vanilla Latte',          120.00, '🍦', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'With vanilla syrup'),
(9,  3, 'Hazelnut Latte',         125.00, '🌰', 'https://images.unsplash.com/photo-1518479937681-03319e1e1e9a?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Toasty hazelnut flavor'),
(10, 3, 'Caramel Latte',          125.00, '🍮', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Rich caramel drizzle'),
(11, 3, 'Coconut Latte',          130.00, '🥥', 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop&auto=format&q=80', 0, 1, 1, 'Tropical coconut milk'),

(12, 4, 'Classic Cappuccino',     105.00, '☕', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Equal parts espresso, milk, foam'),
(13, 4, 'Cinnamon Cappuccino',    120.00, '🍂', 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Dusted with cinnamon'),

(14, 5, 'Classic Mocha',          125.00, '🍫', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Chocolate + espresso'),
(15, 5, 'White Mocha',            130.00, '🤍', 'https://images.unsplash.com/photo-1513483460609-1c8a505ea990?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'White chocolate mocha'),
(16, 5, 'Peppermint Mocha',       135.00, '🍃', 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=400&fit=crop&auto=format&q=80', 0, 1, 1, 'Seasonal holiday favorite'),

(17, 6, 'Classic Milk Tea',        95.00, '🧋', 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'With tapioca pearls'),
(18, 6, 'Taro Milk Tea',          105.00, '🟣', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Creamy taro flavor'),
(19, 6, 'Matcha Milk Tea',        115.00, '🍵', 'https://images.unsplash.com/photo-1637608519884-1f4a1e9a3b0b?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Ceremonial matcha'),
(20, 6, 'Buko Pandan Milk Tea',   110.00, '🌴', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&auto=format&q=80', 0, 1, 1, 'Filipino classic twist'),

(21, 7, 'Caramel Frappe',         145.00, '🧊', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Blended caramel over ice'),
(22, 7, 'Mocha Frappe',           145.00, '🍫', 'https://images.unsplash.com/photo-1562077772-3a5f316e5e2a?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Blended chocolate coffee'),
(23, 7, 'Cookies & Cream Frappe', 150.00, '🍪', 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'With cookie crumbs'),

(24, 8, 'Mango Smoothie',         130.00, '🥭', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Fresh Philippine mango'),
(25, 8, 'Strawberry Smoothie',    135.00, '🍓', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Strawberry & yogurt'),
(26, 8, 'Avocado Smoothie',       140.00, '🥑', 'https://images.unsplash.com/photo-1545610923-8a8b0b5b0f43?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Creamy avocado w/ condensed milk'),
(27, 8, 'Matcha Banana Smoothie', 140.00, '🍌', 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=400&h=400&fit=crop&auto=format&q=80', 0, 1, 1, 'Matcha + banana blend'),

(28, 9, 'Butter Croissant',        65.00, '🥐', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Flaky & buttery'),
(29, 9, 'Cinnamon Roll',           75.00, '🍥', 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Freshly baked'),
(30, 9, 'Blueberry Muffin',        70.00, '🫐', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Loaded with berries'),
(31, 9, 'Garlic Bread',            60.00, '🍞', 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Toasted with garlic butter'),

(32, 10, 'Chocolate Cake',         95.00, '🍰', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Slice, rich chocolate'),
(33, 10, 'Sans Rival',            110.00, '🎂', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=400&fit=crop&auto=format&q=80', 0, 1, 1, 'Filipino layered cake'),
(34, 10, 'Cheesecake',            100.00, '🍮', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Classic NY cheesecake'),
(35, 10, 'Ube Cheese Cake',       115.00, '🟣', 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Ube chiffon + cheese'),

(36, 11, 'Chicken Sandwich',      120.00, '🥪', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop&auto=format&q=80', 1, 0, 1, 'Grilled chicken w/ veggies'),
(37, 11, 'Tuna Melt',             105.00, '🧀', 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Toasted tuna & cheese'),
(38, 11, 'BLT',                   115.00, '🥓', 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Bacon, lettuce, tomato'),
(39, 11, 'Ham & Cheese',           95.00, '🧀', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop&auto=format&q=80', 0, 0, 1, 'Toasted ham & cheese');





CREATE TABLE product_sizes (
    product_id INT NOT NULL,
    size_key   VARCHAR(4) NOT NULL,   
    price      DECIMAL(8,2) NOT NULL,
    PRIMARY KEY (product_id, size_key),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO product_sizes (product_id, size_key, price) VALUES
(1,'S',60),(1,'M',80),(1,'L',95),
(2,'S',75),(2,'M',95),(2,'L',110),
(3,'S',65),(3,'M',85),(3,'L',100),
(4,'S',55),(4,'M',70),(4,'L',85),
(5,'S',70),(5,'M',90),(5,'L',105),
(6,'S',100),(6,'M',120),(6,'L',140),
(7,'S',90),(7,'M',110),(7,'L',130),
(8,'S',100),(8,'M',120),(8,'L',140),
(9,'S',105),(9,'M',125),(9,'L',145),
(10,'S',105),(10,'M',125),(10,'L',145),
(11,'S',110),(11,'M',130),(11,'L',150),
(12,'S',85),(12,'M',105),(12,'L',125),
(13,'S',100),(13,'M',120),(13,'L',140),
(14,'S',105),(14,'M',125),(14,'L',145),
(15,'S',110),(15,'M',130),(15,'L',150),
(16,'S',115),(16,'M',135),(16,'L',155),
(17,'S',75),(17,'M',95),(17,'L',115),
(18,'S',85),(18,'M',105),(18,'L',125),
(19,'S',95),(19,'M',115),(19,'L',135),
(20,'S',90),(20,'M',110),(20,'L',130),
(21,'S',125),(21,'M',145),(21,'L',165),
(22,'S',125),(22,'M',145),(22,'L',165),
(23,'S',130),(23,'M',150),(23,'L',170),
(24,'S',110),(24,'M',130),(24,'L',150),
(25,'S',115),(25,'M',135),(25,'L',155),
(26,'S',120),(26,'M',140),(26,'L',160),
(27,'S',120),(27,'M',140),(27,'L',160);









CREATE TABLE users (
    id    VARCHAR(10) PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    pass  VARCHAR(100) NOT NULL,
    role  VARCHAR(30) NOT NULL,
    color VARCHAR(10) DEFAULT NULL
) ENGINE=InnoDB;

INSERT INTO users (id, name, email, pass, role, color) VALUES
('u1', 'Jezel Dela Cruz',       'owner@brewpos.com',     'owner123',     'Owner',            '#6F4E37'),
('u2', 'Jelyn Balidoy',         'admin@brewpos.com',     'admin123',     'Admin',            '#7C3AED'),
('u3', 'Lucky Dagta',           'manager@brewpos.com',   'manager123',   'Manager',          '#0EA5E9'),
('u4', 'Jessa Encinas',         'cashier@brewpos.com',   'cashier123',   'Cashier',          '#F59E0B'),
('u5', 'Arfaxad Mabilin',       'barista@brewpos.com',   'barista123',   'Barista',          '#22C55E'),
('u6', 'Maria Fatima Macasinag','inventory@brewpos.com', 'inventory123', 'Inventory Staff',  '#EF4444'),
('u7', 'Yesha Principe',        'accountant@brewpos.com','accountant123','Accountant',       '#0EA5A4');




CREATE TABLE customers (
    id       VARCHAR(10) PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    phone    VARCHAR(20) DEFAULT NULL,
    email    VARCHAR(150) DEFAULT NULL,
    points   INT NOT NULL DEFAULT 0,
    level    VARCHAR(20) DEFAULT 'Member',
    favorite VARCHAR(100) DEFAULT NULL,
    visits   INT NOT NULL DEFAULT 0,
    spent    DECIMAL(10,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO customers (id, name, phone, email, points, level, favorite, visits, spent) VALUES
('c1', 'Princess Marie Velasco', '0917 555 1234', 'princess.dc@gmail.com',    90,   'Member',   'Caramel Latte',     84,  8450),
('c2', 'Mark Genesis Espejo',    '0918 555 2211', 'tabi tabi po.s@yahoo.com', 350,  'Silver',   'Classic Milk Tea',  31,  3120),
('c3', 'Rizalito Nudo',          '0920 555 3322', 'nudo.m@gmail.com',        1200,  'Platinum', 'Classic Brew',      112, 12450),
('c4', 'Jhon Lawrence Andes',    '0916 555 4455', 'kyo.b@outlook.com',        985,  'Gold',     'Mango Smoothie',    12,  980),
('c5', 'Mark Jan Dixesne',       '0927 555 5566', 'emji.t@gmail.com',         640,  'Gold',     'Affogato',          52,  5230),
('c6', 'Prince John Felix Vargas','0915 555 6677','prince.f@gmail.com',        75,  'Member',   'Taro Milk Tea',     9,   760),
('c7', 'Odeza Garbo',            '0919 555 7788', 'odeza.g@gmail.com',         430,  'Gold',     'Hazelnut Latte',    38,  3870),
('c8', 'Zander Estanislao',      '0939 555 8899', 'zander.e@gmail.com',        210,  'Silver',   'Butter Croissant',  90,  9210);








CREATE TABLE orders (
    id            VARCHAR(20) PRIMARY KEY,   
    qnum          VARCHAR(20) DEFAULT NULL,  
    customer_name VARCHAR(100) DEFAULT 'Walk-in',
    type          VARCHAR(20) DEFAULT NULL,  
    status        VARCHAR(20) DEFAULT NULL,  
    total         DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment       VARCHAR(20) DEFAULT NULL,
    cashier       VARCHAR(100) DEFAULT NULL,
    order_time    VARCHAR(20) DEFAULT NULL,  
    order_date    DATE DEFAULT NULL,
    hold          TINYINT(1) NOT NULL DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE order_items (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    order_id      VARCHAR(20) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    qty           INT NOT NULL DEFAULT 1,
    price         DECIMAL(8,2) NOT NULL,
    customization VARCHAR(255) DEFAULT NULL,  
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;





CREATE TABLE inventory (
    id       VARCHAR(10) PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    stock    DECIMAL(10,2) NOT NULL DEFAULT 0,
    min      DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit     VARCHAR(10) DEFAULT NULL,
    expiry   DATE DEFAULT NULL,
    supplier VARCHAR(100) DEFAULT NULL,
    cost     DECIMAL(10,2) DEFAULT NULL
) ENGINE=InnoDB;

INSERT INTO inventory (id, name, category, stock, min, unit, expiry, supplier, cost) VALUES
('i1',  'Coffee Beans (Arabica)',   'Beans',      18,  10,  'kg',  '2025-08-15', 'Highland Beans Co.', 850),
('i2',  'Espresso Beans (Robusta)', 'Beans',      6,   8,   'kg',  '2025-07-30', 'Mt. Apo Roasters',   780),
('i3',  'Whole Milk',               'Dairy',      42,  20,  'L',   '2025-06-02', 'Dairy Fresh PH',     95),
('i4',  'Oat Milk',                 'Dairy',      12,  10,  'L',   '2025-05-28', 'Oatly PH',           180),
('i5',  'Soy Milk',                 'Dairy',      15,  10,  'L',   '2025-06-05', 'Dairy Fresh PH',     110),
('i6',  'Almond Milk',              'Dairy',      8,   10,  'L',   '2025-05-26', 'Natures Best',       190),
('i7',  'Vanilla Syrup',            'Syrups',     22,  8,   'bot', '2026-01-10', 'Flavor Craft Inc.',  320),
('i8',  'Caramel Syrup',            'Syrups',     7,   8,   'bot', '2026-01-15', 'Flavor Craft Inc.',  320),
('i9',  'Hazelnut Syrup',           'Syrups',     14,  8,   'bot', '2026-02-01', 'Flavor Craft Inc.',  320),
('i10', 'Matcha Powder',            'Tea',        4,   5,   'kg',  '2025-09-20', 'Zen Leaf Imports',   1200),
('i11', 'Tea Leaves (Black)',       'Tea',        25,  10,  'kg',  '2025-12-01', 'Tea House PH',       450),
('i12', 'Cocoa Powder',             'Chocolate',  16,  8,   'kg',  '2025-10-05', 'Cocoa Rich',         650),
('i13', 'White Chocolate',          'Chocolate',  9,   6,   'kg',  '2025-09-12', 'Cocoa Rich',         720),
('i14', 'Paper Cups (12oz)',        'Packaging',  320, 200, 'pcs', NULL,         'FreshPack PH',       5.5),
('i15', 'Cups (16oz)',              'Packaging',  150, 200, 'pcs', NULL,         'FreshPack PH',       6),
('i16', 'Lids',                     'Packaging',  410, 200, 'pcs', NULL,         'FreshPack PH',       2.5),
('i17', 'Straws (Boba)',            'Packaging',  90,  150, 'pcs', NULL,         'FreshPack PH',       1.8),
('i18', 'Whipped Cream',            'Dairy',      11,  6,   'can', '2025-06-20', 'Dairy Fresh PH',     145),
('i19', 'White Sugar',              'Pantry',     28,  10,  'kg',  '2025-11-01', 'SugarMax',           70),
('i20', 'Tapioca Pearls',           'Pantry',     9,   8,   'kg',  '2025-07-15', 'Boba World',         280),
('i21', 'Mango Puree',              'Fruit',      6,   8,   'kg',  '2025-06-25', 'Tropical Delight',   260),
('i22', 'Cinnamon',                 'Pantry',     5,   3,   'kg',  '2026-03-01', 'Spice Rack',         340);




CREATE TABLE promotions (
    id       VARCHAR(10) PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    type     VARCHAR(30) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    code     VARCHAR(30) DEFAULT NULL,
    status   VARCHAR(20) DEFAULT 'Active',
    discount DECIMAL(5,2) DEFAULT 0,
    applies  VARCHAR(30) DEFAULT NULL
) ENGINE=InnoDB;

INSERT INTO promotions (id, name, type, description, code, status, discount, applies) VALUES
('pr1', 'Happy Hour',              'Happy Hour',   '20% off all drinks, 2–5 PM',      'HAPPY20',   'Active',   20, 'drinks'),
('pr2', 'Buy 1 Get 1',             'B1G1',         'Buy 1 frappe get 1 free',         'BOGO',      'Active',   50, 'frappes'),
('pr3', 'Student Discount',        'Student',      '10% off with valid ID',           'STUDENT10', 'Active',   10, 'all'),
('pr4', 'Senior Discount',         'Senior',       '15% off for senior citizens',     'SENIOR15',  'Active',   15, 'all'),
('pr5', 'Seasonal: Peppermint',    'Seasonal',     'Peppermint Mocha at ₱110',         'PAYDAY',    'Active',   20, 'peppermint'),
('pr6', 'Monday Morning',          'Promo Code',   '₱40 off before 10 AM',            'MORNING40', 'Inactive', 40, 'drinks'),
('pr7', 'Social Media Check-in',   'Promo Code',   'Free upgrade on check-in',        'CHECKIN',   'Active',   20, 'upgrade');














CREATE TABLE category_ingredients (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    inventory_id  VARCHAR(10) NOT NULL,
    qty_per_unit  DECIMAL(10,3) NOT NULL,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO category_ingredients (category_name, inventory_id, qty_per_unit) VALUES

('Coffee',     'i1',  0.018),
('Coffee',     'i14', 1),
('Coffee',     'i16', 1),

('Espresso',   'i2',  0.016),
('Espresso',   'i14', 1),
('Espresso',   'i16', 1),

('Latte',      'i2',  0.016),
('Latte',      'i3',  0.15),
('Latte',      'i14', 1),
('Latte',      'i16', 1),

('Cappuccino', 'i2',  0.016),
('Cappuccino', 'i3',  0.12),
('Cappuccino', 'i14', 1),
('Cappuccino', 'i16', 1),

('Mocha',      'i2',  0.016),
('Mocha',      'i3',  0.12),
('Mocha',      'i12', 0.02),
('Mocha',      'i14', 1),
('Mocha',      'i16', 1),

('Milk Tea',   'i11', 0.01),
('Milk Tea',   'i3',  0.1),
('Milk Tea',   'i20', 0.05),
('Milk Tea',   'i15', 1),
('Milk Tea',   'i16', 1),
('Milk Tea',   'i17', 1),

('Frappes',    'i2',  0.016),
('Frappes',    'i3',  0.15),
('Frappes',    'i18', 0.05),
('Frappes',    'i15', 1),
('Frappes',    'i16', 1),
('Frappes',    'i17', 1),

('Smoothies',  'i3',  0.1),
('Smoothies',  'i15', 1),
('Smoothies',  'i16', 1),
('Smoothies',  'i17', 1),

('Pastries',   'i14', 0),
('Cakes',      'i14', 0),
('Sandwiches', 'i14', 0);









CREATE TABLE activity_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_name  VARCHAR(100) NOT NULL,
    user_role  VARCHAR(30)  NOT NULL,
    action     VARCHAR(100) NOT NULL,
    details    VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
