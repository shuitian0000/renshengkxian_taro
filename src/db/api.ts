// 数据库操作API
import {supabase} from '@/client/supabase'

export interface Profile {
  id: string
  openid: string | null
  nickname: string | null
  role: 'user' | 'admin'
  created_at: string
}

export interface Report {
  id: string
  user_id: string | null
  name: string
  birth_date: string
  birth_time: string
  birth_region: string
  calendar_type: string
  face_image_url: string | null
  kline_data: any
  report_data: any
  created_at: string
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const {
    data: {user}
  } = await supabase.auth.getUser()
  if (!user) return null

  const {data, error} = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

  if (error) {
    console.error('获取用户信息失败:', error)
    return null
  }

  return data
}

/**
 * 保存报告
 */
export async function saveReport(reportData: Omit<Report, 'id' | 'created_at'>): Promise<Report | null> {
  const {data, error} = await supabase.from('reports').insert(reportData).select().maybeSingle()

  if (error) {
    console.error('保存报告失败:', error)
    return null
  }

  return data
}

/**
 * 获取用户的报告列表
 */
export async function getUserReports(userId: string): Promise<Report[]> {
  const {data, error} = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false})

  if (error) {
    console.error('获取报告列表失败:', error)
    return []
  }

  return data || []
}

/**
 * 获取报告详情
 */
export async function getReportById(reportId: string): Promise<Report | null> {
  const {data, error} = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle()

  if (error) {
    console.error('获取报告详情失败:', error)
    return null
  }

  return data
}

/**
 * 删除报告
 */
export async function deleteReport(reportId: string): Promise<boolean> {
  const {error} = await supabase.from('reports').delete().eq('id', reportId)

  if (error) {
    console.error('删除报告失败:', error)
    return false
  }

  return true
}

/**
 * 上传面部照片到Supabase Storage
 */
export async function uploadFaceImage(file: any, fileName: string): Promise<string | null> {
  try {
    const {data, error} = await supabase.storage.from('app-8pw7ulesxiip_face_images').upload(fileName, file)

    if (error) {
      console.error('上传图片失败:', error)
      return null
    }

    // 获取公开URL
    const {data: urlData} = supabase.storage.from('app-8pw7ulesxiip_face_images').getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('上传图片异常:', error)
    return null
  }
}

/**
 * 获取图片公开URL
 */
export function getImagePublicUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path

  const {data} = supabase.storage.from('app-8pw7ulesxiip_face_images').getPublicUrl(path)

  return data.publicUrl
}
