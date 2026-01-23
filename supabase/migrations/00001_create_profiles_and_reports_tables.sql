/*
# 创建用户和报告表

## 1. 新建表

### profiles 表
用户信息表，存储用户基本信息和角色
- `id` (uuid, primary key, references auth.users) - 用户ID
- `username` (text, unique) - 用户名
- `email` (text, unique) - 邮箱
- `phone` (text, unique) - 手机号
- `openid` (text) - 微信openid（不设置unique，同一微信用户可能有多个账号）
- `nickname` (text) - 昵称
- `role` (user_role, default: 'user') - 用户角色
- `created_at` (timestamptz, default: now()) - 创建时间

### reports 表
分析报告表，存储用户生成的报告记录
- `id` (uuid, primary key) - 报告ID
- `user_id` (uuid, references profiles) - 用户ID
- `name` (text, not null) - 姓名
- `birth_date` (date, not null) - 出生日期
- `birth_time` (text, not null) - 出生时辰
- `birth_region` (text, not null) - 出生地区
- `calendar_type` (text, not null) - 历法类型（solar/lunar）
- `face_image_url` (text) - 面部照片URL
- `kline_data` (jsonb, not null) - K线图数据
- `report_data` (jsonb, not null) - 分析报告数据
- `created_at` (timestamptz, default: now()) - 创建时间

## 2. 安全策略
- profiles表：公开表，不启用RLS
- reports表：公开表，不启用RLS，所有用户可查看所有报告

## 3. 触发器
- 创建handle_new_user函数，自动同步auth.users到profiles表
- 第一个用户自动设为admin角色
- 同步username和openid字段

## 4. 辅助函数
- is_admin：检查用户是否为管理员
*/

-- 创建用户角色枚举
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- 创建profiles表
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  email text UNIQUE,
  phone text UNIQUE,
  openid text,
  nickname text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 创建reports表
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date NOT NULL,
  birth_time text NOT NULL,
  birth_region text NOT NULL,
  calendar_type text NOT NULL,
  face_image_url text,
  kline_data jsonb NOT NULL,
  report_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 创建is_admin辅助函数
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- 创建用户同步触发器函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- 插入用户信息到profiles表
  INSERT INTO public.profiles (id, username, email, phone, openid, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'username')::text, NULL),
    NEW.email,
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'openid')::text, NULL),
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  
  RETURN NEW;
END;
$$;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();