// src/stores/videoStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/plugins/axios'

export const useVideoStore = defineStore('video', () => {
  // ===== State =====
  const videos = ref([])
  const currentVideo = ref(null)
  const isGenerating = ref(false)
  const progress = ref(0)
  const status = ref('idle')
  const error = ref(null)
  const currentJobId = ref(null)
  const currentVideoId = ref(null)

  // ===== Script =====
  const script = ref([])
  const speaker = ref('Mohamed')
  const mood = ref('auto')
  const useAiImages = ref(true)
  const speakers = ref([])
  const moods = ref([])
  const effects = ref(['fade', 'zoom', 'slide'])

  // ===== Getters =====
  const isProcessing = computed(() => status.value === 'processing' || status.value === 'queued')
  const totalDuration = computed(() => script.value.reduce((sum, s) => sum + (s.duration || 4), 0))
  const sceneCount = computed(() => script.value.length)
  const hasScript = computed(() => script.value.length > 0)
  const hasVideos = computed(() => videos.value.length > 0)

  // ===== Actions =====

  function addScene(text = '', duration = 4, effect = 'fade') {
    script.value.push({
      id: Date.now(),
      text,
      duration,
      effect,
    })
  }

  function removeScene(id) {
    script.value = script.value.filter((s) => s.id !== id)
  }

  function updateScene(id, data) {
    const index = script.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      script.value[index] = { ...script.value[index], ...data }
    }
  }

  function clearScript() {
    script.value = []
  }

  function loadFromText(text) {
    const sentences = text.split(/[.!?،;]/).filter((s) => s.trim().length > 10)
    clearScript()
    sentences.forEach((sentence, index) => {
      addScene(
        sentence.trim(),
        Math.min(4 + Math.floor(sentence.length / 30), 10),
        index % 2 === 0 ? 'fade' : 'zoom',
      )
    })
  }

  async function fetchSpeakers() {
    try {
      const response = await api.get('/speakers')
      if (response.data.success) {
        speakers.value = response.data.data
      }
    } catch (err) {
      console.error('Error fetching speakers:', err)
    }
  }

  async function fetchMoods() {
    try {
      const response = await api.get('/moods')
      if (response.data.success) {
        moods.value = response.data.data
      }
    } catch (err) {
      console.error('Error fetching moods:', err)
    }
  }

  async function fetchVideos() {
    try {
      const response = await api.get('/videos')
      if (response.data.success) {
        videos.value = response.data.data.data || response.data.data || []
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
    }
  }

  async function generateVideo() {
    if (script.value.length === 0) {
      error.value = 'أضف مشاهد للسيناريو'
      return
    }

    try {
      isGenerating.value = true
      status.value = 'queued'
      progress.value = 0
      error.value = null
      currentVideo.value = null

      const payload = {
        script: script.value.map((s) => ({
          text: s.text,
          duration: s.duration || 4,
          effect: s.effect || 'fade',
        })),
        speaker: speaker.value,
        mood: mood.value,
        use_ai_images: useAiImages.value,
      }

      const response = await api.post('/videos/generate', payload)

      if (response.data.success) {
        currentJobId.value = response.data.data.job_id
        currentVideoId.value = response.data.data.video_id
        status.value = 'processing'
        await pollStatus()
      } else {
        throw new Error(response.data.error || 'فشل التوليد')
      }
    } catch (err) {
      error.value = err.response?.data?.error || err.message
      status.value = 'failed'
    } finally {
      if (status.value !== 'processing') {
        isGenerating.value = false
      }
    }
  }

  async function pollStatus() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await api.get(`/videos/${currentVideoId.value}/status`)
          const data = response.data.data

          progress.value = data.progress || 0

          if (data.status === 'completed') {
            clearInterval(interval)
            status.value = 'completed'
            isGenerating.value = false
            currentVideo.value = { url: data.url, ...data }
            await fetchVideos()
            resolve()
          } else if (data.status === 'failed') {
            clearInterval(interval)
            status.value = 'failed'
            error.value = data.error || 'فشل التوليد'
            isGenerating.value = false
            reject(new Error(error.value))
          }
        } catch (err) {
          if (err.response?.status === 404) {
            // انتظر
          } else {
            clearInterval(interval)
            error.value = err.message
            status.value = 'failed'
            isGenerating.value = false
            reject(err)
          }
        }
      }, 2000)

      setTimeout(() => {
        clearInterval(interval)
        if (status.value === 'processing') {
          status.value = 'failed'
          error.value = 'انتهت مهلة التوليد (10 دقائق)'
          isGenerating.value = false
          reject(new Error('Timeout'))
        }
      }, 600000)
    })
  }

  async function deleteVideo(id) {
    try {
      await api.delete(`/videos/${id}`)
      await fetchVideos()
      if (currentVideo.value?.id === id) {
        currentVideo.value = null
      }
    } catch (err) {
      console.error('Error deleting video:', err)
    }
  }

  function resetState() {
    status.value = 'idle'
    progress.value = 0
    error.value = null
    currentJobId.value = null
    currentVideoId.value = null
    isGenerating.value = false
  }

  return {
    videos,
    currentVideo,
    isGenerating,
    progress,
    status,
    error,
    currentJobId,
    currentVideoId,
    script,
    speaker,
    mood,
    useAiImages,
    speakers,
    moods,
    effects,
    isProcessing,
    totalDuration,
    sceneCount,
    hasScript,
    hasVideos,
    addScene,
    removeScene,
    updateScene,
    clearScript,
    loadFromText,
    fetchSpeakers,
    fetchMoods,
    fetchVideos,
    generateVideo,
    deleteVideo,
    resetState,
  }
})
