-- ============================================
-- Update Product Codes to 4-Digit Format
-- ============================================
-- This script updates existing product codes from PRD001, PRD002... 
-- to PRD0001, PRD0002... (4 digits with padding)

-- Update existing product codes to 4-digit format
UPDATE products
SET item_code = 'PRD' || LPAD(REPLACE(item_code, 'PRD', ''), 4, '0')
WHERE item_code ~ '^PRD[0-9]+$'
  AND LENGTH(REPLACE(item_code, 'PRD', '')) < 4;

-- Verify the updates
SELECT item_code, item_name 
FROM products 
WHERE deleted_at IS NULL
ORDER BY item_code;

-- Expected results:
-- PRD001  → PRD0001
-- PRD002  → PRD0002
-- PRD003  → PRD0003
-- PRD004  → PRD0004
-- PRD005  → PRD0005
