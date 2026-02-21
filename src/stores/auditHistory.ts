import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useUserStore } from './user'

export interface AuditRecord {
  id: number
  item: any
  action: 'approved' | 'rejected'
  /** 瀹℃牳绫诲瀷锛歩tem=鍙戝笘瀹℃牳, claim=璁ら瀹℃牳 */
  type: 'item' | 'claim'
  reason?: string
  operator: string
  time: string
}

export const useAuditHistoryStore = defineStore('auditHistory', () => {
  const records = ref<AuditRecord[]>([])
  const userStore = useUserStore()

  /** 鏍规嵁褰撳墠鐢ㄦ埛鐢熸垚 localStorage key */
  function getStorageKey(): string {
    const role = Number(userStore.role) || 0
    const userKey = userStore.username || 'default'
    return `audit_history_${role}_${userKey}`
  }

  /** 浠?localStorage 鍔犺浇褰撳墠鐢ㄦ埛鐨勮褰?*/
  function loadRecords() {
    try {
      const raw = localStorage.getItem(getStorageKey())
      records.value = raw ? JSON.parse(raw) : []
      if (userStore.username) {
        records.value = records.value.map((record) => {
          if (record.operator === userStore.nickname || !record.operator) {
            return { ...record, operator: userStore.username }
          }
          return record
        })
      }
    } catch {
      records.value = []
    }
  }

  /** 淇濆瓨鍒?localStorage */
  function saveRecords() {
    localStorage.setItem(getStorageKey(), JSON.stringify(records.value))
  }

  /**
   * 娣诲姞涓€鏉″鏍歌褰?
   * @param item 鐗╁搧/璁ら鐨勫師濮嬫暟鎹?
   * @param action 閫氳繃 or 椹冲洖
   * @param reason 椹冲洖鍘熷洜锛堝彲閫夛級
   * @param type 瀹℃牳绫诲瀷锛?item' 鍙戝笘瀹℃牳 / 'claim' 璁ら瀹℃牳
   */
  function addRecord(
    item: any,
    action: 'approved' | 'rejected',
    reason?: string,
    type: 'item' | 'claim' = 'item'
  ) {
    const record: AuditRecord = {
      id: Date.now(),
      item: JSON.parse(JSON.stringify(item)), // 娣辨嫹璐濓紝闃叉寮曠敤琚慨鏀?
      action,
      type,
      reason,
      operator: userStore.username || userStore.nickname || '管理员',
      time: new Date().toLocaleString('zh-CN'),
    }
    records.value.unshift(record) // 鏈€鏂扮殑鎺掑墠闈?
    // 鏈€澶氫繚鐣?200 鏉?
    if (records.value.length > 200) {
      records.value = records.value.slice(0, 200)
    }
    saveRecords()
  }

  // 鍒濆鍖栧姞杞?
  loadRecords()

  // 鐩戝惉鐢ㄦ埛鍙樺寲锛岄噸鏂板姞杞藉搴旂敤鎴风殑璁板綍
  watch(() => `${userStore.role}_${userStore.username}`, () => {
    loadRecords()
  })

  return { records, addRecord, loadRecords }
})

