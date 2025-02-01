### Schema.org Graphs

Rich result optimized Schema.org graphs without the `<script type="application/ld+json>`{lang="html"}.

```ts twoslash
useSchemaOrg([
  definePerson({
    name: 'Harlan Wilton',
    sameAs: [
      'https://github.com/harlan-zw',
    ],
    url: 'https://harlanzw.com',
  }),
  defineArticle({
    headline: 'Hello World',
    datePublished: '2024-01-01',
  }),
])
```
