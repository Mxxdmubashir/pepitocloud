-- =========================================================================
-- Pepito Cloud Kitchen Software Initial Seed SQL
-- =========================================================================

-- Outlets
INSERT INTO outlets (id, name, code, address, phone, tax_rate, packaging_fee, is_active)
VALUES ('out-01', 'Pepito Central Cloud Hub 01', 'CK-BLR-01', '#442, 100ft Road, Indiranagar, Bengaluru', '+91 80 4455 6677', 5.0, 25.0, 1);

-- Virtual Brands
INSERT INTO brands (id, outlet_id, name, slug, tagline, cuisine, logo_url, banner_color, rating) VALUES
('b-01', 'out-01', 'Pepito''s Artisan Pizza & Pastas', 'pepito-pizza', 'Slow-fermented sourdough pizzas and handmade Italian pastas', 'Italian & Woodfired', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop', '#E11D48', 4.9),
('b-02', 'out-01', 'Burger Beast Smokehouse', 'burger-beast', 'Smashed Angus burgers, crispy Nashville chicken, and loaded tallow fries', 'American Smokehouse', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', '#EA580C', 4.8),
('b-03', 'out-01', 'Wok & Roll Asian Bowls', 'wok-and-roll', 'Smoky wok-tossed noodles, ramen broths, and firecracker dim sums', 'Pan-Asian & Bowls', 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&h=200&fit=crop', '#059669', 4.7),
('b-04', 'out-01', 'Sweet Escape Bakery & Shakes', 'sweet-escape', 'Artisanal NYC style cookies, molten lava cakes, and thick velvet shakes', 'Desserts & Beverages', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop', '#9333EA', 4.9);

