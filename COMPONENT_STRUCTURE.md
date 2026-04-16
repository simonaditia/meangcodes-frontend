# Rekomendasi Struktur Komponen React

```text
frontend/
  src/
    components/
      layout/
        Navbar.jsx
        Footer.jsx
      article/
        ArticleCard.jsx
        ArticleGrid.jsx
        TrendingList.jsx
        ArticleContent.jsx
      category/
        CategoryPill.jsx
      common/
        Container.jsx
        SectionTitle.jsx
        Loader.jsx
    pages/
      HomePage.jsx
      ArticleDetailPage.jsx
      CategoryPage.jsx
    contexts/
      ThemeContext.jsx
    hooks/
      useArticles.js
      useTheme.js
    services/
      api.js
      articleService.js
    App.jsx
    main.jsx
    index.css
```

Fokus tahap berikutnya:
1. Implement list artikel terbaru + trending di `HomePage`.
2. Implement halaman detail artikel by slug di `ArticleDetailPage`.
3. Integrasi API backend (`/api/articles` dan `/api/articles/:slug`) lewat `services/articleService.js`.
