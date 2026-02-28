//获取系统公告
import request from '@/utils/request'

export interface AnnouncementBody {
  page_num: number
  page_size: number
}

export interface AnnouncementResponse
{
    code: number,
    msg: string,
    data: {
        list: [
            {
                ID: number,
                CreatedAt: string,
                UpdatedAt: string,
                DeletedAt: string | null,
                title: string,
                content: string,
                type: string,
                publisher: string,
                is_top: boolean,
                status: string,
                region: string
            },
        ],
        total: number
    }
}
export const getAnnouncementsApi = (data: AnnouncementBody) => {
  return request.get<AnnouncementResponse>('/api/v1/announcements', {
    params: data
  })
}
