<template>
  <v-app>
    <v-app-bar color="primary" dense>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>🎬 Video Automation</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" variant="text" prepend-icon="mdi-home"> الرئيسية </v-btn>
      <v-btn to="/editor" variant="text" prepend-icon="mdi-pen"> المحرر </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item to="/" prepend-icon="mdi-home">الرئيسية</v-list-item>
        <v-list-item to="/editor" prepend-icon="mdi-pen">المحرر</v-list-item>
        <v-divider></v-divider>
        <v-list-item disabled>
          <span class="text-caption text-grey"> الإصدار {{ version }} </span>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <!-- Snackbar للأخطاء -->
    <v-snackbar v-model="showError" color="error" location="top" timeout="5000">
      {{ videoStore.error }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showError = false"> إغلاق </v-btn>
      </template>
    </v-snackbar>

    <!-- Snackbar للنجاح -->
    <v-snackbar v-model="showSuccess" color="success" location="top" timeout="3000">
      ✅ تم توليد الفيديو بنجاح!
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSuccess = false"> إغلاق </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useVideoStore } from '@/stores/videoStore'

const version = '1.0.0'
const drawer = ref(false)
const showError = ref(false)
const showSuccess = ref(false)

const videoStore = useVideoStore()

// مراقبة حالة الخطأ
watch(
  () => videoStore.error,
  (newError) => {
    if (newError) {
      showError.value = true
    }
  },
)

// مراقبة حالة النجاح
watch(
  () => videoStore.status,
  (newStatus) => {
    if (newStatus === 'completed') {
      showSuccess.value = true
    }
  },
)
</script>

<style>
* {
  font-family: 'Cairo', 'Tahoma', sans-serif;
}

.v-application {
  background: #1a1a2e;
}
</style>
