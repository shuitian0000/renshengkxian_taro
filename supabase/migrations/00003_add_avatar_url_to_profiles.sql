/*
# 添加用户头像字段

## 修改内容

1. 在profiles表添加avatar_url字段：
   - `avatar_url` (text) - 用户头像URL

## 说明

为了提升用户体验，允许用户使用微信头像，需要在profiles表中添加avatar_url字段存储用户头像URL。
*/

-- 添加avatar_url字段到profiles表
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- 添加注释
COMMENT ON COLUMN profiles.avatar_url IS '用户头像URL';
