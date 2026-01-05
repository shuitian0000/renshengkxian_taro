# 任务：人生K线图微信小程序 - 优化改进

## 已完成改进
- [x] 1. 背景色调整为深色主题（玄黑#1A1A1A背景，宣纸白#F5F0E6文字）
- [x] 2. 创建中国地区选择器组件（RegionPicker.tsx）
- [x] 3. 合并首页信息输入（基本信息+面相照片在同一页）
- [x] 4. 创建八卦加载动画组件（BaguaLoading.tsx，"天机推算中"文案）
- [x] 5. 添加八卦旋转动画CSS
- [x] 6. 更新BirthInfoForm组件，集成地区选择器和onChange模式
- [x] 7. 修复首页空白问题
  - 添加uploadFaceImage函数到imageHelper.ts
  - 修复FaceUpload组件接口（添加onImageRemove属性）
  - 导出UploadFileInput类型

## 待完成改进
- [ ] 8. K线图页面添加命理总评
- [ ] 9. 详细报告页面添加返回按钮
- [ ] 10. K线图页面添加返回按钮
- [ ] 11. K线点击交互（显示年龄对应的命理分析）
- [ ] 12. K线图视觉优化（紫色虚线大运周期 + 星星图标高点标记）

## 根本原因分析
首页空白的根本原因：
1. **缺失函数**：imageHelper.ts缺少uploadFaceImage函数导致模块加载失败
2. **组件接口不匹配**：BirthInfoForm只接受onSubmit，首页传入onChange
3. **类型导出问题**：FaceUpload组件未导出UploadFileInput类型
4. **属性缺失**：FaceUpload组件缺少onImageRemove属性

## 修复措施
1. 在imageHelper.ts中添加uploadFaceImage函数（上传到Supabase Storage）
2. 更新BirthInfoForm支持onChange和onSubmit两种模式
3. 在FaceUpload组件中导出UploadFileInput类型
4. 添加onImageRemove属性并实现重新选择功能
5. 简化FaceUpload组件，选择照片后立即触发onImageSelected回调
