<script setup lang="ts">
import { useTranslations } from '../composables/useTranslations'

const { t } = useTranslations()

const businessLinks = [
  { key: 'footer.home', path: '/' },
  { key: 'footer.about', path: '/about' },
  { key: 'footer.media', path: '/gallery' },
  { key: 'footer.contact', path: '/contact' },
  { key: 'footer.terms', path: '/terms' },
  { key: 'footer.privacy', path: '/privacy' },
  { key: 'footer.cookies', path: '/cookies' },
]

const projectLinks = [
  { key: 'footer.project1', path: '/projects/1' },
  { key: 'footer.project2', path: '/projects/2' },
  { key: 'footer.project3', path: '/projects/3' },
  { key: 'footer.project4', path: '/projects/4' },
  { key: 'footer.project5', path: '/projects/5' },
  { key: 'footer.project6', path: '/projects/6' },
]

const socialLinks = [
  { key: 'footer.facebook', url: '#' },
  { key: 'footer.instagram', url: '#' },
  { key: 'footer.linkedin', url: '#' },
  { key: 'footer.youtube', url: '#' },
]
</script>

<template>
  <footer class="bg-white text-zinc-900 py-16 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Newsletter Section -->
      <div class="mb-16">
        <div class="flex justify-between items-center border-b border-zinc-900/20 pb-4 mb-8">
          <h2 class="text-xl font-normal font-roboto leading-loose">გახდით ჩვენი გამომწერი</h2>
          <button
            class="text-base font-normal font-roboto uppercase leading-relaxed tracking-widest text-zinc-900 hover:text-zinc-600"
          >
            Subscribe
          </button>
        </div>
        <div class="border-b border-zinc-900/20"></div>
      </div>

      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <!-- Business Section -->
        <div>
          <h3 class="text-lg font-normal font-roboto leading-normal mb-6">ბიზნესი</h3>
          <ul class="space-y-4">
            <li>
              <router-link
                to="/"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                მთავარი გვერდი
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                ჩვენ შესახებ
              </router-link>
            </li>
            <li>
              <router-link
                to="/gallery"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                მედია
              </router-link>
            </li>
            <li>
              <router-link
                to="/contact"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                კონტაქტი
              </router-link>
            </li>
            <li>
              <router-link
                to="/terms"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                გამოყენების წესები
              </router-link>
            </li>
            <li>
              <router-link
                to="/privacy"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                კონფიდენციალურობის პოლიტიკა
              </router-link>
            </li>
            <li>
              <router-link
                to="/cookies"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                ქუქიების პოლიტიკა
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Projects Section -->
        <div>
          <h3 class="text-lg font-normal font-roboto leading-normal mb-6">პროექტები</h3>
          <ul class="space-y-4">
            <li>
              <router-link
                to="/projects/1"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                პროექტი 1
              </router-link>
            </li>
            <li>
              <router-link
                to="/projects/2"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                პროექტი 2
              </router-link>
            </li>
            <li>
              <router-link
                to="/projects/3"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                პროექტი 3
              </router-link>
            </li>
            <li>
              <router-link
                to="/projects/4"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                პროექტი 4
              </router-link>
            </li>
            <li>
              <router-link
                to="/projects/5"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                პროექტი 5
              </router-link>
            </li>
            <li>
              <router-link
                to="/projects/6"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
              >
                პროექტი 6
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Social Section -->
        <div>
          <h3 class="text-lg font-normal font-roboto leading-normal mb-6">და სხვა</h3>
          <ul class="space-y-4">
            <li>
              <a
                href="#"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-lg font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Linkedin
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-xl font-normal font-roboto leading-relaxed text-zinc-900 hover:text-zinc-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Youtube
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Section -->
        <div>
          <h3 class="text-lg font-normal font-roboto leading-normal mb-6">კავშირი</h3>
          <div class="space-y-6">
            <!-- Address -->
            <div>
              <h4 class="text-xl font-normal font-roboto leading-loose mb-2">მისამართი</h4>
              <p class="text-base font-normal font-roboto leading-loose">
                იუნკერთა ქუჩა №1, კომერციული ფართი №1, Tbilisi, Georgia
              </p>
              <a
                href="#"
                class="text-xs font-normal font-roboto leading-3 text-red-700 hover:text-red-800"
              >
                ლოკაცია
              </a>
            </div>

            <!-- Email -->
            <div>
              <span class="text-xl font-normal font-roboto leading-loose">ელ.ფოსტა: </span>
              <a
                href="mailto:info@unitydev.ge"
                class="text-xl font-normal font-roboto leading-loose text-zinc-900 hover:text-zinc-600"
              >
                info@unitydev.ge
              </a>
            </div>

            <!-- Phone -->
            <div>
              <span class="text-xl font-normal font-roboto leading-loose">ტელ: </span>
              <div class="flex items-center space-x-4">
                <a
                  href="tel:032300333"
                  class="text-lg font-normal font-roboto leading-loose text-zinc-900 hover:text-zinc-600"
                >
                  032 2 300 333
                </a>
                <span class="w-px h-5 bg-zinc-900"></span>
                <a
                  href="tel:995577300333"
                  class="text-lg font-normal font-roboto leading-loose text-zinc-900 hover:text-zinc-600"
                >
                  995 577 300 333
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-black h-5 mb-8"></div>
      <div
        class="flex flex-col md:flex-row justify-between items-center text-base font-normal font-roboto leading-loose"
      >
        <span>იუნითი ჯგუფი</span>
        <span>© ყველა უფლება დაცულია</span>
        <span>შექმნილია Design Sins -ს მიერ</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Additional styles if needed */
</style>
