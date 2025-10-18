-- B2B Orders Database Seed Data

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES
('Acme Corporation', 'contact@acme.com', '+1-555-0100'),
('Global Tech Solutions', 'info@globaltech.com', '+1-555-0101'),
('Retail Masters Inc', 'orders@retailmasters.com', '+1-555-0102'),
('Supply Chain Pro', 'sales@supplychainpro.com', '+1-555-0103'),
('Enterprise Buyers LLC', 'purchasing@enterprisebuyers.com', '+1-555-0104');

-- Insert sample products
INSERT INTO products (sku, name, price_cents, stock) VALUES
('LAPTOP-001', 'Business Laptop Pro 15"', 129900, 50),
('MOUSE-001', 'Wireless Ergonomic Mouse', 4500, 200),
('KEYBOARD-001', 'Mechanical Keyboard RGB', 8900, 150),
('MONITOR-001', '27" 4K Monitor', 45900, 75),
('HEADSET-001', 'Noise Cancelling Headset', 15900, 100),
('WEBCAM-001', 'HD Webcam 1080p', 7900, 120),
('DESK-001', 'Adjustable Standing Desk', 59900, 30),
('CHAIR-001', 'Ergonomic Office Chair', 39900, 40),
('DOCK-001', 'USB-C Docking Station', 18900, 80),
('CABLE-001', 'USB-C Cable 2m', 1200, 500);

-- Insert sample orders
INSERT INTO orders (customer_id, status, total_cents) VALUES
(1, 'CONFIRMED', 389700),
(1, 'CREATED', 129900),
(2, 'CONFIRMED', 145800),
(3, 'CANCELED', 59900),
(4, 'CREATED', 99800);

-- Insert sample order items for order 1 (CONFIRMED)
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(1, 1, 3, 129900, 389700);

-- Insert sample order items for order 2 (CREATED)
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(2, 1, 1, 129900, 129900);

-- Insert sample order items for order 3 (CONFIRMED)
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(3, 2, 10, 4500, 45000),
(3, 3, 5, 8900, 44500),
(3, 6, 7, 7900, 55300);

-- Insert sample order items for order 4 (CANCELED)
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(4, 7, 1, 59900, 59900);

-- Insert sample order items for order 5 (CREATED)
INSERT INTO order_items (order_id, product_id, qty, unit_price_cents, subtotal_cents) VALUES
(5, 8, 1, 39900, 39900),
(5, 7, 1, 59900, 59900);

-- Insert sample idempotency keys (expired examples)
INSERT INTO idempotency_keys (key_value, target_type, target_id, status, response_body, expires_at) VALUES
('idem-key-example-1', 'order', 1, 'CONFIRMED', '{"success": true, "orderId": 1}', DATE_ADD(NOW(), INTERVAL 1 HOUR)),
('idem-key-example-2', 'order', 3, 'CONFIRMED', '{"success": true, "orderId": 3}', DATE_ADD(NOW(), INTERVAL 1 HOUR));
