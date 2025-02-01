### Flat SEO Meta

Was it `<meta property`{lang="html"} or `<meta name`{lang="html"}? Who can remember, just use `useSeoMeta()`{lang="ts"}.

```ts twoslash
useSeoMeta({
  ogType: 'article',
  author: 'Harlan Wilton',
  articleAuthor: ['Harlan Wilton'],
  articlePublishedTime: '2024-01-01',
  articleModifiedTime: '2024-01-01',
  twitterData1: 'Harlan Wilton',
  twitterLabel1: 'Author',
  twitterData2: '10 min',
  twitterLabel2: 'Read Time',
})
```
