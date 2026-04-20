-- Insert test investments
WITH project_data AS (
  SELECT id, title FROM projects LIMIT 10
)
INSERT INTO investments (investor_id, project_id, amount, status)
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'تطبيق التداول الذكي للعملات الرقمية' LIMIT 1),
  500000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'حل إدارة المشاريع السحابي' LIMIT 1),
  400000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'تطبيق الصحة واللياقة البدنية' LIMIT 1),
  300000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'محرك البحث الذكي للمحتوى العربي' LIMIT 1),
  600000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'منصة التعليم الإلكتروني التفاعلية' LIMIT 1),
  250000,
  'committed'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'تطبيق توصيل الطعام الذكي' LIMIT 1),
  350000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'منصة الطاقة المتجددة للأفراد' LIMIT 1),
  200000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'تطبيق إدارة الفنادق الذكي' LIMIT 1),
  450000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'منصة التسويق الرقمي المدمجة' LIMIT 1),
  320000,
  'paid'::investment_status
UNION ALL
SELECT 
  NULL::uuid,
  (SELECT id FROM projects WHERE title = 'تطبيق تعلم اللغات بالذكاء الاصطناعي' LIMIT 1),
  180000,
  'committed'::investment_status;
