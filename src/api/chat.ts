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
            type?: number,// 1=文本(默认)，2=图片
            is_read?: boolean,
            item_id?: number
        }[],
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
          target_id?: number,
          target_name?: string,
          avatar?: string,
          last_msg?: string,
          last_time?: string,
          unread_count?: number
    }[]
}

export interface ChatSessionItem {
    target_id?: number
    target_name?: string
    avatar?: string
    last_msg?: string
    last_time?: string
    unread_count?: number
}
export interface SignReadResponse {
    code: number,
    msg: string,
    data: null
}
//获取会话列表接口
export function getChatList() {
  return request.get<GetChatListResponse>('/api/v1/messages/chats')
}
// 获取与特定用户的聊天历史记录
export function getChatHistory(params: GetChatHistoryParams) {
    return request.get<GetChatHistoryResponse>('/api/v1/messages/history', {
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
//例 {
//     "receiver_id": 2,           // 必填，接收消息的用户ID
//     "content": "请问这个物品还在吗？", // 必填，消息内容
//     "type": 1,                  // 选填，消息类型：1=文本(默认)，2=图片
//     "item_id": 105              // 选填，如果是针对某个物品发起的咨询，带上物品ID
// }

// 标记消息为已读接口
export function signRead(target_id: number) {
    return request.put<SignReadResponse>('/api/v1/messages/read', { target_id }) // 必填，将与该用户(ID为2)的所有收到的消息标记为已读
}

//确认认领接口
export function confirmClaim(id: number) {
    return request.put(`/api/v1/claims/${id}/confirm`)
}
