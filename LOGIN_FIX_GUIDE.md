# 登录头像昵称问题修复说明

## 问题根本原因

通过全面排查，发现了**关键问题**：

### 1. 数据库验证
```sql
SELECT id, nickname, avatar_url, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

**结果：** 所有用户的`nickname`和`avatar_url`都是`null`，说明后端没有正确保存用户信息。

### 2. 后端代码问题

**问题代码：**
```typescript
await supabaseAdmin.from('profiles').upsert({
  id: user.id,
  openid: openid,
  nickname: defaultNickname,
  avatar_url: avatarUrl || '',
  email: email  // ❌ profiles表没有email列！
}, {
  onConflict: 'id'
});
```

**问题分析：**
- profiles表结构：`id`, `openid`, `nickname`, `role`, `created_at`, `avatar_url`
- **没有`email`列**
- 尝试插入不存在的列会导致upsert失败
- 但原代码没有检查错误，所以失败被静默忽略

### 3. 前端时序问题

**问题代码：**
```typescript
if (session) {
  Taro.showToast({ title: '登录成功' })
  
  // 立即检查登录状态
  checkLoginStatus()  // ❌ 可能数据库还没写入完成
}
```

**问题分析：**
- 登录成功后立即查询用户信息
- 但后端可能还在写入数据库
- 导致获取到的是旧数据（null）

## 修复方案

### 修复1：移除不存在的email字段

**修改文件：** `supabase/functions/wechat-miniprogram-login/index.ts`

```typescript
// ✅ 修复后：只插入存在的列
const { data: profileData, error: profileError } = await supabaseAdmin.from('profiles').upsert({
  id: user.id,
  openid: openid,
  nickname: defaultNickname,
  avatar_url: avatarUrl || ''
  // 移除了 email: email
}, {
  onConflict: 'id'
}).select();

// ✅ 添加错误检查
if (profileError) {
  console.error('保存用户信息失败:', profileError);
  return new Response(JSON.stringify({ 
    message: `保存用户信息失败: ${profileError.message}` 
  }), { 
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

console.log('用户信息保存成功:', profileData);
```

### 修复2：添加延迟确保数据已保存

**修改文件：** `src/pages/profile/index.tsx`

```typescript
if (session) {
  Taro.showToast({ title: '登录成功' })

  // ✅ 等待500ms确保后端数据已保存
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // ✅ 重新获取用户信息
  await checkLoginStatus()

  // 处理重定向...
}
```

### 修复3：添加详细日志

**前端日志：**
```typescript
console.log('发送登录请求，参数:', { code, nickName, avatarUrl })
console.log('登录接口返回:', data)
console.log('获取到的用户信息:', currentUser)
```

**后端日志：**
```typescript
console.log('准备保存用户信息:', { id, openid, nickname, avatar_url })
console.log('用户信息保存成功:', profileData)
```

## 验证步骤

### 1. 部署Edge Function
```bash
supabase_deploy_edge_function wechat-miniprogram-login
```
✅ 已完成

### 2. 测试登录流程

1. 打开小程序，进入"我的"页面
2. 点击"登录/注册"
3. 选择微信头像
4. 输入昵称
5. 点击"登录/注册"按钮
6. 等待登录成功提示
7. 查看"我的"页面是否显示头像和昵称

### 3. 查看日志

**前端日志（微信开发者工具控制台）：**
```
发送登录请求，参数: { code: "...", nickName: "测试用户", avatarUrl: "https://..." }
登录接口返回: { token: "...", openid: "..." }
获取到的用户信息: { id: "...", nickname: "测试用户", avatar_url: "https://..." }
```

**后端日志（Supabase Dashboard）：**
```
准备保存用户信息: { id: "...", openid: "...", nickname: "测试用户", avatar_url: "https://..." }
用户信息保存成功: [{ id: "...", nickname: "测试用户", avatar_url: "https://..." }]
```

### 4. 验证数据库

```sql
SELECT id, nickname, avatar_url, created_at
FROM profiles
WHERE nickname IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

**预期结果：** 应该看到新登录用户的nickname和avatar_url不为null

## 关键改进

1. ✅ **修复数据库写入失败**
   - 移除不存在的email字段
   - 添加错误检查和日志
   - 使用.select()返回插入的数据

2. ✅ **修复时序问题**
   - 添加500ms延迟确保数据已保存
   - 登录成功后强制刷新用户信息

3. ✅ **添加详细日志**
   - 前端记录请求参数和返回数据
   - 后端记录保存过程和结果
   - 便于排查问题

4. ✅ **改进错误处理**
   - 后端检查upsert错误并返回
   - 前端显示详细错误信息
   - 避免静默失败

## 预期效果

修复后，用户登录流程：

1. 用户选择头像和输入昵称
2. 点击登录按钮
3. 前端调用后端登录接口，传递头像和昵称
4. 后端保存用户信息到数据库（成功）
5. 前端等待500ms确保数据已保存
6. 前端重新获取用户信息
7. "我的"页面显示用户头像和昵称 ✅

## 如果仍然有问题

请检查以下内容：

1. **查看前端日志**
   - 打开微信开发者工具控制台
   - 查看是否有错误信息
   - 确认请求参数是否正确

2. **查看后端日志**
   - 打开Supabase Dashboard
   - 进入Edge Functions → wechat-miniprogram-login
   - 查看Logs标签
   - 确认是否有错误信息

3. **查看数据库**
   - 打开Supabase Dashboard
   - 进入Table Editor → profiles
   - 查看最新记录的nickname和avatar_url字段
   - 确认是否已保存

4. **检查网络请求**
   - 打开微信开发者工具Network标签
   - 查看登录请求的响应
   - 确认是否返回错误

## 测试清单

- [ ] 选择微信头像成功
- [ ] 输入昵称成功
- [ ] 登录请求发送成功
- [ ] 后端保存用户信息成功
- [ ] 前端获取用户信息成功
- [ ] "我的"页面显示头像成功
- [ ] "我的"页面显示昵称成功
- [ ] 退出登录后重新登录仍然显示
