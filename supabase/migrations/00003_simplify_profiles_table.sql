/*
# 简化profiles表结构

## 变更说明
删除不必要的字段，只保留微信登录所需的核心字段：
- 删除 username 字段（不再使用用户名登录）
- 删除 email 字段（微信登录不需要邮箱）
- 删除 phone 字段（微信登录不需要手机号）
- 保留 openid 字段（微信登录必需）
- 保留 nickname 字段（用户昵称）
- 保留 role 字段（用户角色）

## 安全策略
保持公开表，不启用RLS
*/

-- 删除不必要的字段
ALTER TABLE profiles DROP COLUMN IF EXISTS username;
ALTER TABLE profiles DROP COLUMN IF EXISTS email;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;

-- 更新触发器函数，只同步openid和nickname
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
  INSERT INTO public.profiles (id, openid, nickname, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'openid')::text, NULL),
    COALESCE((NEW.raw_user_meta_data->>'nickname')::text, NULL),
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  )
  ON CONFLICT (id) DO UPDATE SET
    openid = COALESCE((NEW.raw_user_meta_data->>'openid')::text, profiles.openid),
    nickname = COALESCE((NEW.raw_user_meta_data->>'nickname')::text, profiles.nickname);
  
  RETURN NEW;
END;
$$;
