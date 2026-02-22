<template>
  <div class="publish-page">
    <div class="mode-tabs">
      <button class="mode-btn" :class="{ active: publishType === 'lost' }" @click="switchType('lost')">失物帖</button>
      <button class="mode-btn" :class="{ active: publishType === 'found' }" @click="switchType('found')">捡到帖</button>
    </div>

    <div class="publish-card">
      <div class="form-top">
        <div class="left-col">
          <div class="row">
            <div class="tag with-icon">
              <img src="/路径@8.png">
              <span>校区</span>
            </div>
            <div class="options">
              <label v-for="campus in campusOptions" :key="campus" class="option-check">
                <input v-model="form.campus" type="radio" name="campus" :value="campus" />
                <span>{{ campus }}</span>
              </label>
            </div>
          </div>

          <div class="row">
            <div class="tag with-icon">
              <img src="/路径@9.png">
              <span>物品类型</span>
            </div>
            <div class="options">
              <label v-for="category in categoryOptions" :key="category" class="option-check">
                <input v-model="form.category" type="radio" name="category" :value="category" />
                <span>{{ category }}</span>
              </label>
            </div>
          </div>

          <div class="row">
            <div class="tag with-icon">
              <img src="/路径@10.png">
              <span>赏金</span>
            </div>
            <div class="input-wrap short">
              <input v-model="form.bounty" type="number" placeholder="请输入数字（非必填）（默认0）" />
              <span class="counter">数字</span>
            </div>
          </div>

          <div class="row">
            <div class="left-label">联系方式</div>
            <div class="input-wrap long">
              <input v-model="form.contactPhone" type="text" placeholder="请输入文字" maxlength="30" />
              <span class="counter">{{ form.contactPhone.length }}/30</span>
            </div>
          </div>
        </div>

        <div class="right-col">
          <div class="field-row">
            <label>物品名称</label>
            <div class="input-wrap">
              <input v-model="form.title" type="text" placeholder="请输入文字" maxlength="20" />
              <span class="counter">{{ form.title.length }}/20</span>
            </div>
          </div>

          <div class="field-row">
            <label>{{ timeLabel }}</label>
            <div class="input-wrap">
              <input v-model="form.time" type="text" placeholder="请输入时间" maxlength="20" />
              <span class="counter">{{ form.time.length }}/20</span>
            </div>
          </div>

          <div class="field-row">
            <label>{{ locationLabel }}</label>
            <div class="input-wrap">
              <input v-model="form.location" type="text" placeholder="请输入文字" maxlength="20" />
              <span class="counter">{{ form.location.length }}/20</span>
            </div>
          </div>

          <div class="field-row">
            <label>联系人</label>
            <div class="input-wrap">
              <input v-model="form.contactName" type="text" :placeholder="publishType === 'found' ? '请输入文字（非必填）' : '请输入文字'" maxlength="20" />
              <span class="counter">{{ form.contactName.length }}/20</span>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-row">
        <div class="left-label">物品特征</div>
        <div class="textarea-wrap">
          <textarea v-model="form.description" placeholder="请输入文字" maxlength="400"></textarea>
          <span class="counter">{{ form.description.length }}/400</span>
        </div>
      </div>

      <div class="images-row">
        <div v-for="(preview, index) in imagePreviews" :key="preview" class="image-box preview-wrap">
          <img :src="preview" class="preview-image" />
          <button class="remove-btn" type="button" @click="removeImage(index)">×</button>
        </div>
        <button
          v-if="imageFiles.length < 4"
          class="image-box upload-btn"
          type="button"
          @click="triggerSelectImages"
        >+
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden-input"
          @change="handleSelectImages"
        />
      </div>

      <div class="upload-hint">照片最多上传4张（选填）</div>

      <div class="actions">
        <ConfirmButton
          v-if="!submitting"
          class="main-confirm"
          label="发布"
          title="确认发布"
          :message="confirmMessage"
          confirm-text="确认发布"
          cancel-text="取消"
          @confirm="handleSubmit"
        />
        <button v-else type="button" class="main-btn" :disabled="true">发布中...</button>
        <button type="button" class="main-btn" :disabled="submitting" @click="handleCancel">取消</button>
      </div>

      <div class="guide-card">
        <p>{{ pageHint }}</p>
        <p>{{ guideLine1 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { publishItemApi, type PublishType } from '@/api/Publish'
import { uploadImagesAndGetUrls } from '@/utils/imageUpload'
import ConfirmButton from '@/components/ConfirmButton.vue'
const route = useRoute()
const router = useRouter()

const campusOptions = ['朝晖', '屏峰', '莫干山']
const categoryOptions = ['电子', '证件', '衣服', '书籍', '其他']

const form = reactive({
  campus: '朝晖',
  category: '电子',
  bounty: '',
  contactPhone: '',
  title: '',
  time: '',
  location: '',
  contactName: '',
  description: ''
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const imageFiles = ref<File[]>([])
const imagePreviews = ref<string[]>([])
const submitting = ref(false)

const publishType = computed<PublishType>(() => {
  return route.query.type === 'found' ? 'found' : 'lost'
})

const pageHint = computed(() => (publishType.value === 'found' ? '请填写你捡到物品的信息，帮助失主快速找回。' : '请填写你丢失物品的信息，方便同学协助寻找。'))
const guideLine1 = computed(() => (publishType.value === 'found' ? '建议上传清晰图片，并准确填写拾取地点与时间。' : '建议上传最近照片，并准确填写丢失地点与时间。'))
const timeLabel = computed(() => (publishType.value === 'found' ? '捡到时间' : '丢失时间'))
const locationLabel = computed(() => (publishType.value === 'found' ? '捡到地点' : '丢失地点'))
const confirmMessage = computed(() => (publishType.value === 'found' ? '确认发布捡到帖吗？发布后可在首页查看。' : '确认发布失物帖吗？发布后可在首页查看。'))

const switchType = (type: PublishType) => {
  if (type === publishType.value) return
  router.replace({ path: '/StudentHome/publish', query: { type } })
}

const triggerSelectImages = () => {
  fileInputRef.value?.click()
}

const handleSelectImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length === 0) return

  const remain = 4 - imageFiles.value.length
  if (remain <= 0) {
    ElMessage.warning('最多上传4张图片')
    target.value = ''
    return
  }

  const accepted = files.slice(0, remain)
  imageFiles.value.push(...accepted)
  imagePreviews.value.push(...accepted.map((file) => URL.createObjectURL(file)))

  if (files.length > remain) {
    ElMessage.warning('最多上传4张图片，超出部分已忽略')
  }

  target.value = ''
}

const removeImage = (index: number) => {
  const [removedPreview] = imagePreviews.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
  if (removedPreview) {
    URL.revokeObjectURL(removedPreview)
  }
}

const handleSubmit = async () => {
  const title = form.title.trim()
  if (!title) {
    ElMessage.warning('请填写物品名称')
    return
  }

  submitting.value = true
  try {
    const uploadedUrls = await uploadImagesAndGetUrls(imageFiles.value)

    const payload = {
      title,
      type: publishType.value,
      campus: form.campus || undefined,
      category: form.category || undefined,
      location: form.location.trim() || undefined,
      time: form.time.trim() || undefined,
      description: form.description.trim() || undefined,
      img1: uploadedUrls[0],
      img2: uploadedUrls[1],
      img3: uploadedUrls[2],
      img4: uploadedUrls[3],
      contact_name: form.contactName.trim() || undefined,
      contact_phone: form.contactPhone.trim() || undefined,
      bounty: form.bounty === '' ? undefined : Number(form.bounty)
    }

    const res = await publishItemApi(payload)
    if (Number(res?.data?.code) === 200) {
      ElMessage.success(res?.data?.msg || '发布成功')
      router.push('/StudentHome')
      return
    }

    ElMessage.error(res?.data?.msg || '发布失败')
  } catch (error: any) {
    ElMessage.error(error?.message || '发布失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/StudentHome')
}
</script>

<style scoped>
.publish-page {
  padding: 16px;
  background: #fffdf9;
  min-height: calc(100vh - 60px);
}

.mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.mode-btn {
  border: 1px solid #ffd9b5;
  background: #fff;
  color: #f97316;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
}

.mode-btn.active {
  background: #f97316;
  color: #fff;
}

.publish-card {
  background: #fff;
  border: 1px solid #f0ece4;
  border-radius: 6px;
  padding: 14px 16px 16px;
}

.form-top {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 14px;
}

.row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  margin-bottom: 10px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f7b61f;
  color: #fff;
  border-radius: 16px;
  padding: 4px 10px;
  font-size: 14px;
  width: fit-content;
}

.with-icon {
  background: transparent;
  padding: 0;
}

.with-icon .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #34a9f3;
  font-size: 12px;
}

.with-icon span:last-child {
  background: #34a9f3;
  color: #fff;
  border-radius: 14px;
  padding: 4px 12px;
  font-size: 13px;
}

.row:nth-child(2) .with-icon .icon,
.row:nth-child(2) .with-icon span:last-child {
  background: #f79f3f;
}

.row:nth-child(3) .with-icon .icon,
.row:nth-child(3) .with-icon span:last-child {
  background: #f7b61f;
}

.left-label {
  font-size: 18px;
  color: #45484f;
  line-height: 1;
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.option-check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: #2f3440;
}

.option-check input {
  width: 16px;
  height: 16px;
}

.right-col .field-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  margin-bottom: 10px;
}

.right-col label {
  font-size: 18px;
  color: #45484f;
  line-height: 1;
}

.input-wrap {
  position: relative;
  background: #f4f5f8;
  border-radius: 8px;
  padding: 0 48px 0 10px;
  height: 42px;
  display: flex;
  align-items: center;
}

.input-wrap.short {
  max-width: 560px;
}

.input-wrap.long {
  max-width: 760px;
}

.input-wrap input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}

.counter {
  position: absolute;
  right: 12px;
  color: #7c7f86;
  font-size: 14px;
}

.feature-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  margin: 6px 0 12px;
  align-items: start;
}

.textarea-wrap {
  position: relative;
  background: #f4f5f8;
  border-radius: 8px;
  padding: 10px 54px 10px 10px;
  min-height: 100px;
}

.textarea-wrap textarea {
  border: none;
  outline: none;
  resize: none;
  width: 100%;
  height: 72px;
  background: transparent;
  font-size: 14px;
}

.textarea-wrap .counter {
  right: 12px;
  bottom: 10px;
}

.images-row {
  display: flex;
  gap: 18px;
  margin: 8px 0 8px;
}

.image-box {
  width: 220px;
  height: 130px;
  border-radius: 2px;
  border: 1px solid #e2e3e8;
  background: #f2f3f6;
  overflow: hidden;
}

.preview-wrap {
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  line-height: 1;
}

.upload-btn {
  border: none;
  font-size: 52px;
  color: #92959b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-hint {
  color: #5f6570;
  font-size: 14px;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 56px;
  margin-top: 2px;
}

.main-btn {
  width: 52px;
  height: 32px;
  border: none;
  border-radius: 5px;
  background: #3463d7;
  color: #fff;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.actions :deep(.main-confirm.confirm-button),
.actions :deep(.confirm-button.main-confirm) {
  width: 170px;
  min-width: 170px;
  height: 52px;
  border: none;
  border-radius: 10px;
  background: #3463d7 !important;
  color: #fff;
  font-size: 20px;
  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.actions :deep(.main-confirm.confirm-button:hover),
.actions :deep(.confirm-button.main-confirm:hover) {
  background: #2e59c5;
}

.main-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

.guide-card {
  margin-top: 10px;
  background: #fffdf9;
  border: 1px dashed #f1dcc3;
  border-radius: 8px;
  padding: 8px 10px;
  color: #475467;
  line-height: 1.6;
  font-size: 14px;
}

</style>
