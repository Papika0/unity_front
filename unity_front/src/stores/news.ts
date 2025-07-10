import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface NewsTranslation {
  ka: string
  en: string
}

export interface NewsArticle {
  id: number
  is_active: boolean
  is_featured: boolean
  title: NewsTranslation
  content: NewsTranslation
  excerpt: NewsTranslation
  main_image: string
  gallery_images: string[]
  publish_date: string
  category: 'company' | 'project' | 'industry' | 'event'
  tags: string[]
  views: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export const useNewsStore = defineStore('news', () => {
  // State
  const articles = ref<NewsArticle[]>([
    {
      id: 1,
      is_active: true,
      is_featured: true,
      title: {
        ka: 'უნიტიმ დაასრულა uniTY ბალანსის პირველი ეტაპი',
        en: 'Unity Completes First Phase of uniTY Balance',
      },
      content: {
        ka: `უნიტი აცხადებს uniTY ბალანსის პირველი ეტაპის წარმატებით დასრულებას. ეს თანამედროვე საცხოვრებელი კომპლექსი, რომელიც მდებარეობს ვაკეში, წარმოადგენს ჩვენი კომპანიის ახალ მიღწევას ეკოლოგიური და მდგრადი განვითარების მიმართულებით.
        
        პროექტის პირველ ეტაპში აშენდა 120 ბინა, რომლებიც აღჭურვილია უახლესი ტექნოლოგიებით და შესაბამისობაშია ყველაზე მაღალ ევროპულ სტანდარტებთან. კომპლექსი მოიცავს:
        
        • ენერგოეფექტური სისტემები
        • მწვანე ღია სივრცეები
        • თანამედროვე უსაფრთხოების სისტემა
        • მოსახერხებელი პარკინგი
        • საბავშვო და სპორტული მოედნები
        
        მეორე ეტაპის მშენებლობა დაიწყება 2025 წლის იანვარში და გაგრძელდება 18 თვის განმავლობაში.`,
        en: `Unity announces the successful completion of the first phase of uniTY Balance. This modern residential complex, located in Vake, represents our company's new achievement in the direction of ecological and sustainable development.
        
        In the first phase of the project, 120 apartments were built, which are equipped with the latest technologies and comply with the highest European standards. The complex includes:
        
        • Energy efficient systems
        • Green open spaces
        • Modern security system
        • Convenient parking
        • Children's and sports grounds
        
        Construction of the second phase will begin in January 2025 and will continue for 18 months.`,
      },
      excerpt: {
        ka: 'უნიტიმ წარმატებით დაასრულა uniTY ბალანსის პირველი ეტაპი - 120 ბინიანი თანამედროვე საცხოვრებელი კომპლექსი ვაკეში.',
        en: 'Unity successfully completed the first phase of uniTY Balance - a modern residential complex with 120 apartments in Vake.',
      },
      main_image: '/images/news/unity-balance-phase1.jpg',
      gallery_images: [
        '/images/news/unity-balance-construction-1.jpg',
        '/images/news/unity-balance-construction-2.jpg',
        '/images/news/unity-balance-interior-1.jpg',
        '/images/news/unity-balance-exterior-1.jpg',
      ],
      publish_date: '2024-07-01T09:00:00Z',
      category: 'project',
      tags: ['uniTY ბალანსი', 'მშენებლობა', 'ვაკე', 'პირველი ეტაპი'],
      views: 1250,
      meta_title: 'უნიტიმ დაასრულა uniTY ბალანსის პირველი ეტაპი',
      meta_description:
        'უნიტიმ წარმატებით დაასრულა uniTY ბალანსის პირველი ეტაპი - 120 ბინიანი თანამედროვე საცხოვრებელი კომპლექსი ვაკეში.',
      created_at: '2024-07-01T08:30:00Z',
      updated_at: '2024-07-01T09:00:00Z',
    },
    {
      id: 2,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'უნიტი ქართულ-გერმანული ბიზნეს ასოციაციის წევრი გახდა',
        en: 'Unity Becomes Member of Georgian-German Business Association',
      },
      content: {
        ka: `უნიტი პატივისცემით აცხადებს ქართულ-გერმანული ბიზნეს ასოციაციის წევრობაზე. ეს მნიშვნელოვანი ნაბიჯი ხაზს უსვამს ჩვენს მისწრაფებას ევროპული სტანდარტების დანერგვისა და საერთაშორისო თანამშრომლობის განვითარებისკენ.
        
        ქართულ-გერმანული ბიზნეს ასოციაციის წევრობა მოგვცემს შესაძლებლობას:
        
        • გავუზიაროთ გამოცდილება გერმანელ კომპანიებს
        • შევისწავლოთ უახლესი ტექნოლოგიები და მეთოდები
        • გავაძლიეროთ საერთაშორისო პარტნიორობა
        • გავზარდოთ ჩვენი პროექტების ხარისხი
        
        ამ თანამშრომლობის ფარგლებში ვგეგმავთ ერთობლივ პროექტებს, რომლებიც შემოიტანს ინოვაციურ გადაწყვეტებს ქართულ მშენებლობის ბაზარზე.`,
        en: `Unity proudly announces its membership in the Georgian-German Business Association. This significant step emphasizes our commitment to implementing European standards and developing international cooperation.
        
        Membership in the Georgian-German Business Association will give us the opportunity to:
        
        • Share experience with German companies
        • Learn the latest technologies and methods
        • Strengthen international partnerships
        • Increase the quality of our projects
        
        Within the framework of this cooperation, we plan joint projects that will bring innovative solutions to the Georgian construction market.`,
      },
      excerpt: {
        ka: 'უნიტი გახდა ქართულ-გერმანული ბიზნეს ასოციაციის წევრი, რაც ხაზს უსვამს ევროპული სტანდარტების დანერგვისადმი ჩვენს მისწრაფებას.',
        en: 'Unity became a member of the Georgian-German Business Association, emphasizing our commitment to implementing European standards.',
      },
      main_image: '/images/news/georgian-german-association.jpg',
      gallery_images: [
        '/images/news/association-ceremony-1.jpg',
        '/images/news/association-ceremony-2.jpg',
      ],
      publish_date: '2024-06-15T14:30:00Z',
      category: 'company',
      tags: ['თანამშრომლობა', 'ასოციაცია', 'გერმანია', 'საერთაშორისო'],
      views: 890,
      meta_title: 'უნიტი ქართულ-გერმანული ბიზნეს ასოციაციის წევრი გახდა',
      meta_description:
        'უნიტი გახდა ქართულ-გერმანული ბიზნეს ასოციაციის წევრი, რაც ხაზს უსვამს ევროპული სტანდარტების დანერგვისადმი ჩვენს მისწრაფებას.',
      created_at: '2024-06-15T13:00:00Z',
      updated_at: '2024-06-15T14:30:00Z',
    },
    {
      id: 3,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'მშენებლობის ინდუსტრიაში ახალი ტექნოლოგიები',
        en: 'New Technologies in Construction Industry',
      },
      content: {
        ka: `მშენებლობის ინდუსტრია მუდმივად ვითარდება და ახალი ტექნოლოგიები კარდინალურად ცვლის ამ სფეროს. უნიტი, როგორც ინოვაციური კომპანია, აქტიურად იყენებს უახლეს მიღწევებს თავის პროექტებში.
        
        მთავარი ტრენდები, რომლებსაც ვაქცევთ ყურადღებას:
        
        • BIM (Building Information Modeling) ტექნოლოგია
        • ენერგოეფექტური მასალები
        • "ჭკვიანი" სახლების სისტემები
        • მდგრადი მშენებლობის მეთოდები
        • 3D მოდელირება და ვირტუალური რეალობა
        
        ეს ტექნოლოგიები საშუალებას გვაძლევს შევქმნათ უფრო ხარისხიანი, ენერგოეფექტური და კომფორტული საცხოვრებელი სივრცეები.`,
        en: `The construction industry is constantly evolving and new technologies are dramatically changing this field. Unity, as an innovative company, actively uses the latest achievements in its projects.
        
        Main trends that we pay attention to:
        
        • BIM (Building Information Modeling) technology
        • Energy efficient materials
        • Smart home systems
        • Sustainable construction methods
        • 3D modeling and virtual reality
        
        These technologies allow us to create higher quality, more energy efficient and comfortable living spaces.`,
      },
      excerpt: {
        ka: 'მშენებლობის ინდუსტრიაში ახალი ტექნოლოგიები კარდინალურად ცვლის სფეროს. უნიტი აქტიურად იყენებს ინოვაციურ მიღწევებს.',
        en: 'New technologies in the construction industry are dramatically changing the field. Unity actively uses innovative achievements.',
      },
      main_image: '/images/news/construction-technologies.jpg',
      gallery_images: [
        '/images/news/bim-technology.jpg',
        '/images/news/smart-home-systems.jpg',
        '/images/news/sustainable-materials.jpg',
      ],
      publish_date: '2024-05-20T11:15:00Z',
      category: 'industry',
      tags: ['ტექნოლოგია', 'ინოვაცია', 'BIM', 'ჭკვიანი სახლი'],
      views: 1580,
      meta_title: 'მშენებლობის ინდუსტრიაში ახალი ტექნოლოგიები',
      meta_description:
        'მშენებლობის ინდუსტრიაში ახალი ტექნოლოგიები კარდინალურად ცვლის სფეროს. უნიტი აქტიურად იყენებს ინოვაციურ მიღწევებს.',
      created_at: '2024-05-20T10:00:00Z',
      updated_at: '2024-05-20T11:15:00Z',
    },
    {
      id: 4,
      is_active: true,
      is_featured: false,
      title: {
        ka: 'უნიტი მონაწილეობდა საერთაშორისო მშენებლობის ვორკშოპში',
        en: 'Unity Participated in International Construction Workshop',
      },
      content: {
        ka: `უნიტის წარმომადგენლები მონაწილეობდნენ ბათუმში ჩატარებულ საერთაშორისო მშენებლობის ვორკშოპში "მდგრადი განვითარება 2024". ღონისძიება ორგანიზებული იყო ქართული და ევროპული კომპანიების თანამშრომლობისთვის.
        
        ვორკშოპის ძირითადი თემები იყო:
        
        • მდგრადი მშენებლობის პრინციპები
        • ენერგოეფექტურობის ზრდის მეთოდები
        • ეკოლოგიური მასალების გამოყენება
        • ღია სივრცეების დაგეგმვა
        • ციფრული ტექნოლოგიების ინტეგრაცია
        
        ჩვენმა გუნდმა გააზიარა გამოცდილება uniTY ბალანსის პროექტზე და მიიღო ფასდაუდებელი ცოდნა ევროპული პარტნიორებისგან.`,
        en: `Unity representatives participated in the international construction workshop "Sustainable Development 2024" held in Batumi. The event was organized for cooperation between Georgian and European companies.
        
        The main topics of the workshop were:
        
        • Principles of sustainable construction
        • Methods of increasing energy efficiency
        • Use of ecological materials
        • Planning of open spaces
        • Integration of digital technologies
        
        Our team shared experience on the uniTY Balance project and gained valuable knowledge from European partners.`,
      },
      excerpt: {
        ka: 'უნიტის წარმომადგენლები მონაწილეობდნენ ბათუმში ჩატარებულ საერთაშორისო მშენებლობის ვორკშოპში "მდგრადი განვითარება 2024".',
        en: 'Unity representatives participated in the international construction workshop "Sustainable Development 2024" held in Batumi.',
      },
      main_image: '/images/news/workshop-batumi.jpg',
      gallery_images: [
        '/images/news/workshop-presentation.jpg',
        '/images/news/workshop-participants.jpg',
        '/images/news/workshop-networking.jpg',
      ],
      publish_date: '2024-04-10T16:45:00Z',
      category: 'event',
      tags: ['ვორკშოპი', 'ბათუმი', 'მდგრადი განვითარება', 'საერთაშორისო'],
      views: 720,
      meta_title: 'უნიტი მონაწილეობდა საერთაშორისო მშენებლობის ვორკშოპში',
      meta_description:
        'უნიტის წარმომადგენლები მონაწილეობდნენ ბათუმში ჩატარებულ საერთაშორისო მშენებლობის ვორკშოპში "მდგრადი განვითარება 2024".',
      created_at: '2024-04-10T15:30:00Z',
      updated_at: '2024-04-10T16:45:00Z',
    },
  ])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeArticles = computed(() =>
    articles.value
      .filter((article) => article.is_active)
      .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()),
  )

  const featuredArticles = computed(() =>
    articles.value
      .filter((article) => article.is_featured && article.is_active)
      .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()),
  )

  const articlesByCategory = computed(() => {
    const grouped: Record<string, NewsArticle[]> = {}
    activeArticles.value.forEach((article) => {
      if (!grouped[article.category]) {
        grouped[article.category] = []
      }
      grouped[article.category].push(article)
    })
    return grouped
  })

  const recentArticles = computed(() => activeArticles.value.slice(0, 5))

  const popularArticles = computed(() =>
    [...activeArticles.value].sort((a, b) => b.views - a.views).slice(0, 5),
  )

  // Actions
  const getArticleById = (id: number): NewsArticle | undefined => {
    return articles.value.find((article) => article.id === id && article.is_active)
  }

  const getArticlesByCategory = (category: NewsArticle['category']): NewsArticle[] => {
    return articles.value
      .filter((article) => article.category === category && article.is_active)
      .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
  }

  const searchArticles = (query: string, lang: 'ka' | 'en' = 'ka'): NewsArticle[] => {
    const lowercaseQuery = query.toLowerCase()
    return articles.value.filter(
      (article) =>
        article.is_active &&
        (article.title[lang].toLowerCase().includes(lowercaseQuery) ||
          article.content[lang].toLowerCase().includes(lowercaseQuery) ||
          article.excerpt[lang].toLowerCase().includes(lowercaseQuery) ||
          article.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))),
    )
  }

  const incrementViews = (id: number): void => {
    const article = articles.value.find((article) => article.id === id)
    if (article) {
      article.views++
    }
  }

  // Future API integration methods
  const fetchArticles = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/api/news')
      // articles.value = response.data

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (err) {
      error.value = 'Failed to fetch articles'
      console.error('Error fetching articles:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchArticleById = async (id: number): Promise<NewsArticle | null> => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/api/news/${id}`)
      // return response.data

      // For now, return from local data
      const article = getArticleById(id)
      if (article) {
        incrementViews(id)
      }
      return article || null
    } catch (err) {
      error.value = 'Failed to fetch article'
      console.error('Error fetching article:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    articles,
    isLoading,
    error,

    // Getters
    activeArticles,
    featuredArticles,
    articlesByCategory,
    recentArticles,
    popularArticles,

    // Actions
    getArticleById,
    getArticlesByCategory,
    searchArticles,
    incrementViews,
    fetchArticles,
    fetchArticleById,
  }
})
