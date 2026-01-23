/*
# 创建面部照片存储桶

## 1. 存储桶配置
- 桶名：app-8pw7ulesxiip_face_images
- 公开访问：true
- 文件大小限制：1MB
- 允许的MIME类型：image/jpeg, image/png, image/webp

## 2. 安全策略
- 所有用户都可以上传图片
- 所有用户都可以查看图片
*/

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-8pw7ulesxiip_face_images',
  'app-8pw7ulesxiip_face_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 允许所有用户上传
CREATE POLICY "Allow all users to upload face images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'app-8pw7ulesxiip_face_images');

-- 允许所有用户查看
CREATE POLICY "Allow all users to view face images"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-8pw7ulesxiip_face_images');

-- 允许用户删除自己的图片
CREATE POLICY "Allow users to delete their own face images"
ON storage.objects FOR DELETE
USING (bucket_id = 'app-8pw7ulesxiip_face_images');