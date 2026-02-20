import request from '@/utils/request'
export interface GetChatHistoryParams {
  target_id: number
  page_num?: number
  page_size?: number
}

export interface GetChatHistoryResponse {
    code: number,
    msg: string,
    data: {
        list: {
            ID?: number,
            CreatedAt?: string,
            UpdatedAt?: string,
            DeletedAt?: string | null,
            sender_id?: number,
            sender?: {
                ID?: number,
                CreatedAt?: string,
                UpdatedAt?: string,
                DeletedAt?: string | null,
                username?: string,
                role?: number,
                name?: string,
                nickname?: string,
                avatar?: string,
                phone?: string,
                is_active?: boolean,
                first_login?: boolean
            },
            receiver_id?: number,
            receiver?: {
                ID?: number,
                CreatedAt?: string,
                UpdatedAt?: string,
                DeletedAt?: string | null,
                username?: string,
                role?: number,
                name?: string,
                nickname?: string,
                avatar?: string,
                phone?: string,
                is_active?: boolean,
                first_login?: boolean
            },
            content?: string,
            type?: number,
            is_read?: boolean,
            item_id?: number
        }[],
        total?: number
    }
}
export interface SendMessageRequest {
    receiver_id: number
    content: string
    type?: number
    item_id?: number
}
export interface GetChatListResponse {
    code: number,
    msg: string,
    data: {
          targiet_id?: number,
          target_name?: string,
          avatar?: string,
          last_msg?: string,
          last_time?: string,
          unread_count?: number
    }[]
}
//获取会话列表接口
export function getChatList() {
  return request.get<GetChatListResponse>('/api/v1/chat/list')
}
// 获取与特定用户的聊天历史记录
export function getChatHistory(params: GetChatHistoryParams) {
    return request.get<GetChatHistoryResponse>('/api/v1/chat/history', {
        params: {
            target_id: params.target_id,
            page_num: params.page_num || 1,
            page_size: params.page_size || 20
        }
    })
}
// 发送消息接口
export function sendMessage(data: SendMessageRequest) {
    return request.post('/api/v1/messages', data)
}
