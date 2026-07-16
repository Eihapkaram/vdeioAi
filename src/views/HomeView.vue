<template>
  <v-container fluid class="home-container">
    <v-row>
      <v-col cols="12">
        <v-card class="hero-card" elevation="0">
          <v-card-text class="text-center pa-8">
            <v-icon size="80" color="primary">mdi-video-account</v-icon>
            <h1 class="text-h3 font-weight-bold mt-4">
              🎬 منشئ الفيديوهات التلقائي
            </h1>
            <p class="text-h6 text-grey mt-4">
              حول نصوصك إلى فيديوهات احترافية بصوت مصري طبيعي
            </p>

            <v-row class="mt-6">
              <v-col cols="12" md="4">
                <v-card class="feature-card">
                  <v-card-text class="text-center">
                    <v-icon color="primary" size="40">mdi-voice</v-icon>
                    <h3>صوت مصري طبيعي</h3>
                    <p class="text-grey">أصوات مدربة على اللهجة المصرية</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="feature-card">
                  <v-card-text class="text-center">
                    <v-icon color="primary" size="40">mdi-image-filter</v-icon>
                    <h3>توليد صور بالذكاء الاصطناعي</h3>
                    <p class="text-grey">صور فريدة مناسبة لكل مشهد</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="feature-card">
                  <v-card-text class="text-center">
                    <v-icon color="primary" size="40">mdi-infinite</v-icon>
                    <h3>مجاني ولا محدود</h3>
                    <p class="text-grey">استخدم الأداة مجاناً دون أي قيود</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-btn
              color="primary"
              size="x-large"
              to="/editor"
              class="mt-6"
              prepend-icon="mdi-pen"
            >
              ابدأ الآن
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- عرض آخر الفيديوهات -->
    <v-row v-if="videoStore.hasVideos" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span class="text-h5">📹 فيديوهات سابقة</span>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="videoStore.fetchVideos()" size="small">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="video in videoStore.videos"
                :key="video.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card class="video-card">
                  <v-img
                    v-if="video.url"
                    :src="video.url + '?thumbnail'"
                    height="180"
                    cover
                    class="bg-grey-darken-3"
                  >
                    <v-chip
                      :color="video.status === 'completed' ? 'success' : 
                             video.status === 'processing' ? 'warning' : 'error'"
                      size="small"
                      class="ma-2"
                    >
                      {{ video.status === 'completed' ? 'جاهز' : 
                         video.status === 'processing' ? 'قيد المعالجة' : 'فشل' }}
                    </v-chip>
                  </v-img>
                  <v-card-title class="text-subtitle-1 text-truncate">
                    {{ video.title }}
                  </v-card-title>
                  <v-card-subtitle>
                    {{ formatDate(video.created_at) }}
                    <span class="mx-1">•</span>
                    {{ Math.round(video.duration || 0) }} ثانية
                  </v-card-subtitle>
                  <v-card-actions>
                    <v-btn
                      v-if="video.url"
                      size="small"
                      :href="video.url"
                      target="_blank"
                      color="primary"
                    >
                      <v-icon>mdi-play</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="video.url"
                      size="small"
                      :href="video.url"
                      download
                      color="success"
                    >
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      size="small"
                      color="error"
                      @click="videoStore.deleteVideo(video.id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVideoStore } from '@/stores/videoStore'

const videoStore = useVideoStore()

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  videoStore.fetchVideos()
  videoStore.fetchSpeakers()
  videoStore.fetchMoods()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px !important;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.video-card {
  transition: transform 0.3s;
  height: 100%;
}

.video-card:hover {
  transform: translateY(-5px);
}
</style>