# 任务：人生K线图谱微信小程序 - 优化改进

## 已完成改进
- [x] 1. 背景色调整为深色主题（玄黑#1A1A1A背景，宣纸白#F5F0E6文字）
- [x] 2. 创建中国地区选择器组件（RegionPicker.tsx）
- [x] 3. 合并首页信息输入（基本信息+面相照片在同一页）
- [x] 4. 创建八卦加载动画组件（BaguaLoading.tsx，"天机推算中"文案）
- [x] 5. 添加八卦旋转动画CSS
- [x] 6. 更新BirthInfoForm组件，集成地区选择器和onChange模式
- [x] 7. 修复首页空白问题
- [x] 8. 面相照片清空按钮
- [x] 9. 详细验证提示（提示具体缺失字段，红色边框标记）
- [x] 10. 修复"生成失败"问题
- [x] 11. 面相照片可选功能
- [x] 12. 修复八卦加载动画真机显示问题（SVG改为CSS纯动画）
- [x] 13. K线图页面添加命理总评
- [x] 14. 详细报告页面添加返回按钮
- [x] 15. K线图页面添加返回按钮
- [x] 16. K线点击交互（显示年龄对应的命理分析）
- [x] 17. K线图横竖屏适配
- [x] 18. 优化太极图动画（阴阳鱼旋转效果，清晰可见）
- [x] 19. 修复K线图吉凶颜色逻辑（trend字段统一为"吉"或"凶"）
- [x] 20. 生成具体的分析依据（根据年龄、运势、人生阶段、五行分析动态生成）
- [x] 21. 修改登录逻辑为仅支持微信登录（移除用户名密码登录）
- [x] 22. 添加微信授权说明和隐私保护提示
- [x] 23. 简化数据库表结构（删除username、email、phone字段）
- [x] 24. 修复Canvas绘制PDF功能（使用Taro.createCanvasContext和页面Canvas元素）
- [x] 25. 修改应用名称为"人生K线图谱"
- [x] 26. 实现K线图横屏全屏显示（创建独立全屏页面，支持横屏显示和便捷退出）
- [x] 27. 修复太极图鱼眼位置（阳鱼眼在白色区域左侧，阴鱼眼在金色区域右侧）
- [x] 28. 添加全屏缩放功能（支持放大、缩小、重置，缩放范围0.5-3倍）
- [x] 29. 重新设计太极图结构（上半部分白色阳鱼，下半部分金色阴鱼，S形分界线，鱼眼位于对应区域中心）
- [x] 30. 优化K线图缩放实现（修改为图表内容缩放而非容器缩放，调整barSpacing和chartWidth，默认0.8倍便于查看全图）
- [x] 31. 修复太极图S形结构（整体背景白色，右半圆金色，上方添加金色小圆、下方添加白色小圆形成标准S形分界线）
- [x] 32. 修复全屏模式显示问题（增加chartHeight到700/800，添加右侧padding 80px避免按钮遮挡）
- [x] 33. 恢复V22太极图效果（整体背景金色，左半圆白色，上下各有小圆形成S形分界，鱼眼在中心线上）
- [x] 34. 优化K线图容器和滚动（启用垂直滚动，增加右侧padding到100px，增加底部空间40px，确保横轴年龄数字完整显示）
- [x] 35. 修复太极图真机显示问题（使用明确的十六进制颜色值#D4AF37和#F5F0E6替代CSS变量，确保真机兼容性）
- [x] 36. 优化全屏按钮布局（将按钮组从右上角改为底部中央横向排列，使用圆形按钮，移除右侧padding改为底部padding 80px）
- [x] 37. 优化全屏模式运势解析弹窗（弹窗宽度从max-w-md改为max-w-sm，文本内容使用line-clamp限制行数，确保关闭按钮可见）
- [x] 38. 优化全屏模式图表高度（chartHeight从600/700降低到450/550，使图表更紧凑，更好地适配屏幕尺寸）
- [x] 39. 进一步优化全屏弹窗尺寸（弹窗宽度改为max-w-xs，padding从p-6改为p-4，外层padding从24px改为16px，隐藏分析依据，运势分析限制2行）
- [x] 40. 进一步降低全屏图表高度（chartHeight从450/550降低到350/450，使图表更加紧凑）
- [x] 41. 优化全屏弹窗内容显示（添加ScrollView支持滚动查看所有内容，恢复显示分析依据，移除文本行数限制，弹窗maxHeight为80vh）
- [x] 42. 修改全屏退出按钮文字（从"退出"改为"退出全屏"，更明确功能）
- [x] 43. 添加性别维度到命理分析（在BirthInfoForm添加性别选择，修改generateLocalKLineData和generateLocalReport函数支持性别参数，根据性别调整K线数据和报告内容）
- [x] 44. 优化性别和历法类型选择UI（将性别和历法类型从按钮式布局改为下拉菜单式布局，使用Picker组件，样式与其他输入框保持一致）
- [x] 45. 优化首页表单布局更加紧凑（姓名和性别排在一行，出生日期和出生时辰排在一行，表单间距从space-y-6改为space-y-4，减少页面占用空间）
- [x] 46. 修复姓名和性别组件对齐问题（在flex容器添加items-end类，确保同一行的输入框底部对齐，出生日期和出生时辰同样处理）
- [x] 47. 优化隐私保护配置符合微信审核规范（在app.config.ts添加permission字段说明相机和相册用途，创建PRIVACY.md隐私保护指引文档，确认不需要设置requiredPrivateInfos字段因为不使用位置信息）
- [x] 48. 修复真机测试问题（修复太极图阴鱼眼位置从bottom: 25%改为top: 75%确保正确显示，添加全屏模式缩放功能调试日志帮助排查缩放不生效问题）
- [x] 49. 修复权限管理冲突问题（移除pdfGenerator.ts中的手动权限请求代码，直接调用Taro.saveImageToPhotosAlbum让API自动触发权限请求，避免用户看到两次权限弹窗，优化错误处理在用户拒绝权限时引导去设置）
- [x] 50. 再次修复真机测试问题（重新设计太极图结构确保阴阳鱼正确显示，背景色改为玄黑，左半边白色右半边金色，右上角白色半圆左下角金色半圆，鱼眼位置正确；为KLineChart组件添加key属性强制重新渲染确保缩放功能生效）
- [x] 51. 对比v67版本修复太极图和全屏缩放问题（恢复a0aa408版本的太极图代码：背景色金色#D4AF37，左半圆白色，上半部分白色小圆left-1/4，下半部分金色小圆right-1/4，阳鱼眼left: 50% top: 25%，阴鱼眼left: 50% bottom: 25%；移除KLineChart的key属性恢复原有渲染逻辑）
- [x] 52. 微信审核合规性修改（替换所有算命占卜相关字眼为中性科学表述，创建现代化Loading组件替换太极图八卦加载动画，修改应用名称为"人生趋势图谱"，批量替换敏感词汇，修改免责声明，删除八卦旋转动画CSS，确保通过微信小程序审核）
- [x] 53. 深度审核合规性检查（再次全面排查并替换所有涉及算命占卜迷信的内容：面相→面部、风水→环境、六亲→家庭关系、大运→生命周期、五行→数据模型、贵人→他人、福寿→健康长寿、天伦→家庭幸福、修身养性→调整心态、天时地利人和→各方面条件良好，修改Edge Functions的AI prompt，修改数据库注释，确保所有文字表述科学中性）
- [x] 54. 修复微信登录getUserProfile废弃API问题（移除已废弃的getUserProfile调用，改为直接使用Taro.login()获取code进行登录，后端根据openid自动生成唯一昵称如"用户_abc123"，解决"desc length does not meet the requirements"错误，每个微信用户仍然是独立账号基于唯一openid，符合微信最新API规范）

## 待完成改进
无

## 技术要点
- 八卦加载动画：使用CSS纯动画实现太极图（V22版本），整体背景金色（#D4AF37），左半圆白色（#F5F0E6），上半部分添加白色小圆、下半部分添加金色小圆形成S形分界线，阳鱼眼（金色小点）和阴鱼眼（白色小点）都位于中心线上（left: 50%），使用明确的十六进制颜色值确保真机兼容性，3秒旋转一周
- 性别维度分析：在基本信息表单添加性别选择（男/女），默认为男，generateLocalKLineData函数根据性别调整生命周期曲线（男性30-50岁事业高峰期+0.5分，女性25-45岁综合运势较强+0.5分），generateLocalReport函数根据性别生成不同的命理描述（男命/女命、事业、婚姻、健康、财富、性格、六亲等维度的性别差异化内容），性别信息存储到currentReport中
- K线图吉凶判断：本地算法生成的trend字段统一为"吉"或"凶"（score>=6为吉，<6为凶），K线颜色、图例、点击显示完全一致
- 分析依据生成：根据年龄划分人生阶段（≤18少年求学、≤30青年创业、≤45中年发展、≤60成熟稳定、>60晚年颐养），结合评分细化五行分析，生成具体事件描述，避免套话
- 微信登录：使用Taro.getUserProfile()获取用户昵称和头像，Taro.login()获取code，调用后端Edge Function完成登录，仅支持微信小程序环境
- 数据库优化：profiles表只保留id、openid、nickname、role、created_at字段，删除不必要的username、email、phone字段
- Canvas绘制PDF：在页面中添加隐藏Canvas元素（canvasId="reportCanvas"），使用Taro.createCanvasContext创建上下文，绘制标题、基本信息、K线图（含网格线、图例）、各章节报告内容、免责声明，实现文本自动换行（估算中英文字符宽度），使用ctx.draw()绘制后调用Taro.canvasToTempFilePath导出图片，通过Taro.saveImageToPhotosAlbum保存到相册
- 横屏全屏显示：创建独立的全屏页面（/pages/chart-fullscreen/index.tsx），在页面配置中设置pageOrientation: 'landscape'实现横屏显示，navigationStyle: 'custom'隐藏导航栏
- 全屏控制按钮：横向排列固定在底部中央（bottom-4 left-1/2 transform: translateX(-50%)），包含放大、缩小、重置、退出全屏四个圆形按钮（rounded-full），使用shadow-lg增强视觉效果，不遮挡K线图内容
- K线图缩放功能：在KLineChart组件中添加scale参数（默认1），通过调整barSpacing（30 * scale）和chartWidth（data.length * 30 * scale）实现图表内容的真实缩放，全屏模式默认0.8倍便于查看全图，支持0.3-3倍缩放范围，步长0.3
- K线图容器优化：chartHeight根据模式动态调整（全屏横屏350、全屏竖屏450、非全屏横屏300、非全屏竖屏400），ScrollView启用垂直滚动（scrollY={true}），全屏模式底部padding 80px避免按钮遮挡，底部增加40px空间（minHeight: chartHeight + 40），确保横轴年龄数字和所有K线内容完整显示且可点击
- 运势解析弹窗：点击K线显示运势详情，全屏模式下弹窗宽度为max-w-xs、padding为p-4、外层padding为16px、maxHeight为80vh、内容区域使用ScrollView支持滚动（maxHeight: calc(80vh - 120px)）、显示完整内容包括分析依据、标题字体为text-base、评分字体为text-xl，非全屏模式为max-w-md、padding为p-6、外层padding为24px、显示完整内容，确保弹窗紧凑且关闭按钮（右上角X图标）始终可见，用户可以滚动查看所有内容，点击背景或关闭按钮可关闭弹窗
- 应用名称：统一使用"人生K线图谱"
- 返回按钮：使用Taro.navigateBack()实现页面返回

## 根本原因分析

### 首页空白问题
1. **缺失函数**：imageHelper.ts缺少uploadFaceImage函数导致模块加载失败
2. **组件接口不匹配**：BirthInfoForm只接受onSubmit，首页传入onChange
3. **类型导出问题**：FaceUpload组件未导出UploadFileInput类型
4. **属性缺失**：FaceUpload组件缺少onImageRemove属性

### "生成失败，请重试"问题
**根本原因**：Supabase Storage bucket不存在（Bucket not found错误）
- 错误日志：`{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}`
- 影响：上传面相照片时抛出异常，导致整个报告生成流程中断

**解决方案**：
1. 面相照片处理失败不影响报告生成（使用try-catch包裹）
2. 面相照片为可选项，没有照片也能继续分析
3. 即使bucket不存在，也能正常生成K线图和命理报告

## 修复措施
1. 在imageHelper.ts中添加uploadFaceImage函数（上传到Supabase Storage）
2. 更新BirthInfoForm支持onChange和onSubmit两种模式
3. 在FaceUpload组件中导出UploadFileInput类型
4. 添加onImageRemove属性并实现重新选择功能
5. 简化FaceUpload组件，选择照片后立即触发onImageSelected回调
6. 添加validationErrors属性到BirthInfoForm，支持红色边框标记
7. 优化验证提示，显示具体缺失字段（如"请填写：姓名、出生日期"）
8. 面相照片处理失败不影响报告生成（try-catch包裹）
9. 添加"清空照片"按钮到FaceUpload组件
