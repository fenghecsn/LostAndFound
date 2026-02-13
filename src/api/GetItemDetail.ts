//获取物品详情接口
import request from '@/utils/request'
export const getItemDetail = (id: number) => {
  return request ({
    "headers":{
      "Content-Type": "application/json",
    } ,
    url: `/api/v1/items/${id}`,
    method: 'get'
  })
}
