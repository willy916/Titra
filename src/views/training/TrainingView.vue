<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, BookOpen, Video, Youtube, MessageCircle, Search, Download, Play } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

const emit = defineEmits<{ back: []; navigate: [screen: string] }>()

const activeTab = ref('books')

const trainings = {
  books: [
    { id: '1', title: 'Guide complet de la culture du cacao', author: 'Dr. Kouassi Yao', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', price: 0, pages: 120, category: 'Culture' },
    { id: '2', title: "Techniques modernes d'agriculture durable", author: 'Aminata Traoré', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', price: 5000, pages: 200, category: 'Agriculture' },
    { id: '3', title: "Transformation du café en Côte d'Ivoire", author: 'Prof. Jean Baptiste', cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', price: 3500, pages: 85, category: 'Transformation' },
  ],
  videos: [
    { id: '1', title: 'Comment cultiver le cacao bio', instructor: 'Kouadio Farmer', thumbnail: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400', duration: '45 min', price: 0, category: 'Culture', views: 1520 },
    { id: '2', title: 'Gestion financière pour agriculteurs', instructor: 'Marie Finance', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', duration: '1h 20min', price: 7500, category: 'Gestion', views: 890 },
    { id: '3', title: 'Techniques de compostage naturel', instructor: 'Bio Experts', thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400', duration: '30 min', price: 0, category: 'Techniques', views: 2340 },
  ],
  youtubeLinks: [
    { id: '1', title: "Culture du riz irrigué en Côte d'Ivoire", channel: 'AgriTV CI', thumbnail: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400', url: 'https://youtube.com/watch?v=example1' },
    { id: '2', title: 'Élevage de poulets de chair - Formation complète', channel: 'Élevage Pro', thumbnail: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400', url: 'https://youtube.com/watch?v=example2' },
  ],
  trainers: [
    { id: '1', name: 'Dr. Kouassi Yao', specialty: 'Cacaoculture', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', online: true },
    { id: '2', name: 'Aminata Traoré', specialty: 'Agriculture durable', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', online: false },
    { id: '3', name: 'Prof. Jean Baptiste', specialty: 'Transformation', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', online: true },
  ],
}
</script>

<template>
  <div class="min-h-screen bg-background pb-20 lg:pb-0">
    <!-- Mobile Header -->
    <div class="lg:hidden sticky top-0 z-10 bg-background border-b">
      <div class="flex items-center gap-4 p-4">
        <button @click="emit('back')"><ArrowLeft class="w-6 h-6" /></button>
        <h2 class="font-semibold">Espace Formation</h2>
      </div>
    </div>

    <div class="p-4 lg:p-0 space-y-6">
      <!-- Search Bar -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Rechercher une formation, un livre, une vidéo..." class="pl-10" />
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b overflow-x-auto">
        <button @click="activeTab = 'books'" :class="['flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap', activeTab === 'books' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground']">
          <BookOpen class="w-4 h-4" />Livres
        </button>
        <button @click="activeTab = 'videos'" :class="['flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap', activeTab === 'videos' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground']">
          <Video class="w-4 h-4" />Vidéos
        </button>
        <button @click="activeTab = 'youtube'" :class="['flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap', activeTab === 'youtube' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground']">
          <Youtube class="w-4 h-4" />YouTube
        </button>
        <button @click="activeTab = 'trainers'" :class="['flex items-center gap-1 px-4 py-2 text-sm font-medium whitespace-nowrap', activeTab === 'trainers' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground']">
          <MessageCircle class="w-4 h-4" />Formateurs
        </button>
      </div>

      <!-- Books -->
      <div v-if="activeTab === 'books'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="book in trainings.books" :key="book.id" class="overflow-hidden hover:shadow-lg transition-shadow">
          <img :src="book.cover" :alt="book.title" class="w-full h-48 object-cover" />
          <div class="p-4 space-y-3">
            <div>
              <Badge variant="secondary" class="mb-2">{{ book.category }}</Badge>
              <h3 class="font-semibold line-clamp-2">{{ book.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ book.author }}</p>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">{{ book.pages }} pages</span>
              <span class="font-semibold text-primary">{{ book.price === 0 ? 'Gratuit' : book.price.toLocaleString() + ' FCFA' }}</span>
            </div>
            <Button class="w-full bg-primary hover:bg-primary/90">
              <Download class="w-4 h-4 mr-2" />{{ book.price === 0 ? 'Télécharger' : 'Acheter' }}
            </Button>
          </div>
        </Card>
      </div>

      <!-- Videos -->
      <div v-if="activeTab === 'videos'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="video in trainings.videos" :key="video.id" class="overflow-hidden hover:shadow-lg transition-shadow">
          <div class="relative">
            <img :src="video.thumbnail" :alt="video.title" class="w-full h-48 object-cover" />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Play class="w-8 h-8 text-primary ml-1" />
              </div>
            </div>
            <div class="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-white text-sm">{{ video.duration }}</div>
          </div>
          <div class="p-4 space-y-3">
            <div>
              <Badge variant="secondary" class="mb-2">{{ video.category }}</Badge>
              <h3 class="font-semibold line-clamp-2">{{ video.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ video.instructor }}</p>
            </div>
            <div class="flex items-center justify-between text-sm text-muted-foreground">
              <span>{{ video.views.toLocaleString() }} vues</span>
              <span class="font-semibold text-primary">{{ video.price === 0 ? 'Gratuit' : video.price.toLocaleString() + ' FCFA' }}</span>
            </div>
            <Button class="w-full bg-primary hover:bg-primary/90">
              <Play class="w-4 h-4 mr-2" />{{ video.price === 0 ? 'Regarder' : 'Acheter' }}
            </Button>
          </div>
        </Card>
      </div>

      <!-- YouTube Links -->
      <div v-if="activeTab === 'youtube'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="link in trainings.youtubeLinks" :key="link.id" class="overflow-hidden hover:shadow-lg transition-shadow">
          <div class="relative">
            <img :src="link.thumbnail" :alt="link.title" class="w-full h-48 object-cover" />
            <div class="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded flex items-center gap-1 text-white text-sm">
              <Youtube class="w-4 h-4" />YouTube
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div>
              <h3 class="font-semibold line-clamp-2">{{ link.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ link.channel }}</p>
            </div>
            <Button class="w-full bg-red-600 hover:bg-red-700 text-white" @click="window.open(link.url, '_blank')">
              <Youtube class="w-4 h-4 mr-2" />Voir sur YouTube
            </Button>
          </div>
        </Card>
      </div>

      <!-- Trainers -->
      <div v-if="activeTab === 'trainers'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card v-for="trainer in trainings.trainers" :key="trainer.id" class="p-6 hover:shadow-lg transition-shadow">
          <div class="flex items-start gap-4">
            <div class="relative">
              <img :src="trainer.photo" :alt="trainer.name" class="w-16 h-16 rounded-full object-cover" />
              <div v-if="trainer.online" class="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-white" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold">{{ trainer.name }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ trainer.specialty }}</p>
              <Button size="sm" class="bg-primary hover:bg-primary/90" @click="emit('navigate', 'messages')">
                <MessageCircle class="w-4 h-4 mr-2" />Contacter
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
