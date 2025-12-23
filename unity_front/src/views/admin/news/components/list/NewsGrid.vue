<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
    <NewsCard
      v-for="article in articles"
      :key="article.id"
      :article="article"
      @view="$emit('view', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminNewsArticle } from '@/types/index'
import NewsCard from './NewsCard.vue'

defineProps<{
  articles: AdminNewsArticle[]
}>()

defineEmits<{
  (e: 'view', id: number): void
  (e: 'edit', id: number): void
  (e: 'delete', article: AdminNewsArticle): void
}>()
</script>
