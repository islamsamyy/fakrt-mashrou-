-- Get user IDs from created accounts
WITH founder_ids AS (
  SELECT id, full_name FROM profiles 
  WHERE role = 'founder' 
  ORDER BY created_at DESC 
  LIMIT 3
),
investor_ids AS (
  SELECT id, full_name FROM profiles 
  WHERE role = 'investor' 
  ORDER BY created_at DESC 
  LIMIT 4
)
-- Insert test projects
INSERT INTO projects (
  founder_id, title, description, category, 
  funding_goal, amount_raised, status, verified
) 
SELECT 
  f.id,
  'تطبيق التداول الذكي للعملات الرقمية',
  'منصة تداول آمنة وسهلة للعملات الرقمية مع تحليلات ذكية',
  'FinTech',
  5000000,
  2100000,
  'active',
  true
FROM founder_ids f WHERE f.full_name = 'أحمد السويدي'
UNION ALL
SELECT 
  f.id,
  'حل إدارة المشاريع السحابي',
  'منصة شاملة لإدارة المشاريع بكفاءة عالية',
  'SaaS',
  3000000,
  1200000,
  'active',
  false
FROM founder_ids f WHERE f.full_name = 'فاطمة الزهراني'
UNION ALL
SELECT 
  f.id,
  'تطبيق الصحة والعافية',
  'تطبيق متكامل لتتبع الصحة واللياقة البدنية',
  'HealthTech',
  2500000,
  875000,
  'active',
  true
FROM founder_ids f WHERE f.full_name = 'محمد العنزي'
UNION ALL
SELECT 
  f.id,
  'محرك البحث الذكي المحلي',
  'محرك بحث مخصص للمحتوى العربي',
  'AI',
  4000000,
  1600000,
  'active',
  false
FROM founder_ids f WHERE f.full_name = 'أحمد السويدي'
UNION ALL
SELECT 
  f.id,
  'منصة التعليم الإلكتروني التفاعلية',
  'منصة تعليمية بنموذج تفاعلي وشامل',
  'SaaS',
  2000000,
  600000,
  'active',
  true
FROM founder_ids f WHERE f.full_name = 'فاطمة الزهراني';
