<template>
  <v-container fluid class="editor-container">
    <v-row>
      <!-- محرر السيناريو -->
      <v-col cols="12" lg="7">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span class="text-h5">✍️ محرر السيناريو</span>
            <v-spacer></v-spacer>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="addNewScene"> إضافة مشهد </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- أداة لصق النص -->
            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="pastedText"
                  label="أو الصق نصاً كاملاً (سيتم تقسيمه تلقائياً)"
                  rows="2"
                  variant="outlined"
                  @input="handleTextPaste"
                  placeholder="اكتب نصك هنا وسيتم تقسيمه إلى مشاهد..."
                  clearable
                ></v-textarea>
              </v-col>
            </v-row>

            <!-- قائمة المشاهد -->
            <v-list>
              <v-list-item
                v-for="(scene, index) in videoStore.script"
                :key="scene.id"
                class="scene-item"
              >
                <template v-slot:prepend>
                  <v-chip color="primary" size="small" class="mr-2"> #{{ index + 1 }} </v-chip>
                </template>

                <v-row align="center">
                  <v-col cols="12" sm="6" md="7">
                    <v-text-field
                      v-model="scene.text"
                      variant="plain"
                      placeholder="نص المشهد..."
                      density="compact"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" sm="2" md="2">
                    <v-text-field
                      v-model.number="scene.duration"
                      type="number"
                      suffix="ث"
                      variant="plain"
                      density="compact"
                      min="1"
                      max="30"
                      style="max-width: 70px"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" sm="2" md="2">
                    <v-select
                      v-model="scene.effect"
                      :items="videoStore.effects"
                      variant="plain"
                      density="compact"
                      hide-details
                    ></v-select>
                  </v-col>
                  <v-col cols="4" sm="1" md="1">
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      color="error"
                      variant="text"
                      @click="videoStore.removeScene(scene.id)"
                    ></v-btn>
                  </v-col>
                </v-row>
              </v-list-item>

              <!-- رسالة فارغة -->
              <v-list-item v-if="!videoStore.hasScript">
                <v-card-text class="text-center text-grey pa-8">
                  <v-icon size="50">mdi-script-text</v-icon>
                  <p>لا توجد مشاهد. أضف مشهداً جديداً أو الصق نصاً</p>
                  <v-btn color="primary" @click="addNewScene">أضف مشهداً</v-btn>
                </v-card-text>
              </v-list-item>
            </v-list>

            <!-- إحصائيات -->
            <v-divider class="my-4"></v-divider>
            <v-row>
              <v-col cols="4">
                <v-card variant="text">
                  <v-card-text class="text-center">
                    <span class="text-h6">{{ videoStore.sceneCount }}</span>
                    <span class="text-caption d-block text-grey">مشاهد</span>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="text">
                  <v-card-text class="text-center">
                    <span class="text-h6">{{ Math.round(videoStore.totalDuration) }}</span>
                    <span class="text-caption d-block text-grey">ثانية</span>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-card variant="text">
                  <v-card-text class="text-center">
                    <v-icon
                      size="24"
                      :color="
                        videoStore.isProcessing
                          ? 'warning'
                          : videoStore.status === 'completed'
                            ? 'success'
                            : videoStore.status === 'failed'
                              ? 'error'
                              : 'grey'
                      "
                    >
                      {{
                        videoStore.isProcessing
                          ? 'mdi-loading mdi-spin'
                          : videoStore.status === 'completed'
                            ? 'mdi-check-circle'
                            : videoStore.status === 'failed'
                              ? 'mdi-alert-circle'
                              : 'mdi-circle-outline'
                      }}
                    </v-icon>
                    <span class="text-caption d-block text-grey">
                      {{
                        videoStore.status === 'completed'
                          ? 'جاهز'
                          : videoStore.status === 'processing'
                            ? 'قيد المعالجة'
                            : videoStore.status === 'queued'
                              ? 'في الانتظار'
                              : videoStore.status === 'failed'
                                ? 'فشل'
                                : 'في الانتظار'
                      }}
                    </span>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="success"
              size="large"
              :loading="videoStore.isGenerating"
              :disabled="!videoStore.hasScript || videoStore.isProcessing"
              @click="videoStore.generateVideo()"
              prepend-icon="mdi-play-circle"
            >
              {{ videoStore.isGenerating ? 'جاري التوليد...' : 'توليد الفيديو' }}
            </v-btn>

            <v-progress-linear
              v-if="videoStore.isGenerating"
              :model-value="videoStore.progress"
              style="flex-grow: 1; margin-left: 16px"
              height="10"
              color="primary"
              striped
            ></v-progress-linear>

            <v-btn
              v-if="videoStore.hasScript"
              color="error"
              variant="text"
              @click="videoStore.clearScript()"
              prepend-icon="mdi-delete"
            >
              مسح الكل
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- معاينة الفيديو والإعدادات -->
      <v-col cols="12" lg="5">
        <!-- لوحة الإعدادات -->
        <v-card class="mb-4">
          <v-card-title>⚙️ الإعدادات</v-card-title>
          <v-card-text>
            <v-select
              v-model="videoStore.speaker"
              :items="videoStore.speakers"
              label="اختر الصوت"
              variant="outlined"
              density="compact"
              :loading="videoStore.speakers.length === 0"
            ></v-select>

            <v-select
              v-model="videoStore.mood"
              :items="moodOptions"
              label="المزاج العام"
              variant="outlined"
              density="compact"
              :loading="videoStore.moods.length === 0"
            ></v-select>

            <v-switch
              v-model="videoStore.useAiImages"
              label="توليد صور بالذكاء الاصطناعي"
              color="primary"
              inset
            ></v-switch>

            <v-divider class="my-2"></v-divider>

            <v-btn
              v-if="videoStore.currentVideo?.url"
              :href="videoStore.currentVideo.url"
              download
              color="primary"
              block
              prepend-icon="mdi-download"
            >
              تحميل الفيديو
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- معاينة الفيديو -->
        <v-card>
          <v-card-title>
            <span>🎬 معاينة الفيديو</span>
            <v-spacer></v-spacer>
            <v-chip
              v-if="videoStore.currentVideo"
              :color="
                videoStore.status === 'completed'
                  ? 'success'
                  : videoStore.status === 'processing'
                    ? 'warning'
                    : videoStore.status === 'failed'
                      ? 'error'
                      : 'grey'
              "
              size="small"
            >
              {{
                videoStore.status === 'completed'
                  ? 'جاهز'
                  : videoStore.status === 'processing'
                    ? 'قيد المعالجة'
                    : videoStore.status === 'failed'
                      ? 'فشل'
                      : videoStore.status
              }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <!-- حالة المعالجة -->
            <div v-if="videoStore.isProcessing" class="text-center pa-8">
              <v-progress-circular
                :model-value="videoStore.progress"
                size="80"
                color="primary"
                indeterminate
              ></v-progress-circular>
              <p class="mt-4 text-grey">جاري التوليد... {{ Math.round(videoStore.progress) }}%</p>
              <p class="text-caption text-grey">{{ videoStore.error || 'يرجى الانتظار' }}</p>
            </div>

            <!-- فشل -->
            <div v-else-if="videoStore.status === 'failed'" class="text-center pa-8">
              <v-icon size="60" color="error">mdi-alert-circle</v-icon>
              <p class="text-error mt-4">{{ videoStore.error || 'حدث خطأ أثناء توليد الفيديو' }}</p>
              <v-btn color="primary" @click="videoStore.generateVideo()">إعادة المحاولة</v-btn>
            </div>

            <!-- عرض الفيديو -->
            <video
              v-else-if="videoStore.currentVideo?.url"
              :src="videoStore.currentVideo.url"
              controls
              style="width: 100%; max-height: 500px; border-radius: 8px"
            ></video>

            <!-- فارغ -->
            <div v-else class="text-center pa-8 text-grey">
              <v-icon size="50">mdi-video-off</v-icon>
              <p class="mt-2">لا يوجد فيديو معروض</p>
              <p class="text-caption">قم بتوليد فيديو من السيناريو</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVideoStore } from '@/stores/videoStore'

const videoStore = useVideoStore()
const pastedText = ref('')

const moodOptions = computed(() => {
  return ['auto', ...videoStore.moods]
})

const addNewScene = () => {
  videoStore.addScene('', 4, 'fade')
}

const handleTextPaste = () => {
  if (pastedText.value.trim()) {
    videoStore.loadFromText(pastedText.value)
  }
}

onMounted(() => {
  if (!videoStore.hasScript) {
    videoStore.addScene('اكتب نص المشهد الأول هنا...', 4, 'fade')
  }
  videoStore.fetchSpeakers()
  videoStore.fetchMoods()
  videoStore.fetchVideos()
})
</script>

<style scoped>
.editor-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.scene-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 4px 0;
}

.scene-item:last-child {
  border-bottom: none;
}

.text-error {
  color: #ff4757;
}
</style>
