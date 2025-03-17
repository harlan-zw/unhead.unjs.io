import { describe, expect, it } from 'vitest'
import { replaceImportSpecifier } from '../utils/content'

const payload = {
  type: 'minimal',
  value: [
    [
      'h2',
      {
        id: 'introduction',
      },
      'Introduction',
    ],
    [
      'p',
      {},
      'Unhead is built to get you running as quickly as possible. This guide provides a collection of snippets\nto implement common use cases for tags in your ',
      [
        'code',
        {
          className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
          language: 'html',
          style: '',
        },
        [
          'span',
          {
            class: 'sPmlB',
          },
          '<',
        ],
        [
          'span',
          {
            class: 'sbLW1',
          },
          'head',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '>',
        ],
      ],
      '.',
    ],
    [
      'p',
      {},
      'If you\'d like to learn more about how specific tags work, check out ',
      [
        'a',
        {
          href: 'https://zhead.dev/',
          rel: [
            'nofollow',
          ],
        },
        'Zhead: Head Tag Database',
      ],
      ' for\na comprehensive list of tags and their usage.',
    ],
    [
      'h3',
      {
        id: 'defaults',
      },
      'Defaults',
    ],
    [
      'p',
      {},
      'Unhead itself provides defaults for, these can be overriden by you if you need to.',
    ],
    [
      'ul',
      {},
      [
        'li',
        {},
        [
          'code',
          {
            className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
            language: 'html',
            style: '',
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '<',
          ],
          [
            'span',
            {
              class: 'sbLW1',
            },
            'meta',
          ],
          [
            'span',
            {
              class: 'sNAc1',
            },
            ' charset',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '=',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'utf-8',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '>',
          ],
        ],
        ' - Ensures special characters are displayed correctly.',
      ],
      [
        'li',
        {},
        [
          'code',
          {
            className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
            language: 'html',
            style: '',
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '<',
          ],
          [
            'span',
            {
              class: 'sbLW1',
            },
            'meta',
          ],
          [
            'span',
            {
              class: 'sNAc1',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '=',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'viewport',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sNAc1',
            },
            ' content',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '=',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'width=device-width, initial-scale=1',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '>',
          ],
        ],
        ' -\nEnsures your app is responsive and works on all devices.',
      ],
    ],
    [
      'h2',
      {
        id: 'seo-starter',
      },
      'SEO Starter',
    ],
    [
      'p',
      {},
      'While SEO is a complex topic, this starter is just for essential tags to get you started. You may consider combining this with the\n',
      [
        'a',
        {
          href: '#social-share',
        },
        'Social Share',
      ],
      ' and ',
      [
        'a',
        {
          href: '#blog-posts',
        },
        'Blog Posts',
      ],
      ' sections for a more complete solution.',
    ],
    [
      'p',
      {},
      'The ',
      [
        'code',
        {},
        'lang',
      ],
      ' attribute and the semantic tags ',
      [
        'code',
        {
          className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
          language: 'html',
          style: '',
        },
        [
          'span',
          {
            class: 'sPmlB',
          },
          '<',
        ],
        [
          'span',
          {
            class: 'sbLW1',
          },
          'title',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '>',
        ],
      ],
      ' and ',
      [
        'code',
        {
          className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
          language: 'html',
          style: '',
        },
        [
          'span',
          {
            class: 'sPmlB',
          },
          '<',
        ],
        [
          'span',
          {
            class: 'sbLW1',
          },
          'meta',
        ],
        [
          'span',
          {
            class: 'sNAc1',
          },
          ' name',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '=',
        ],
        [
          'span',
          {
            class: 'sjPTm',
          },
          '"',
        ],
        [
          'span',
          {
            class: 'sXi6O',
          },
          'description',
        ],
        [
          'span',
          {
            class: 'sjPTm',
          },
          '"',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '>',
        ],
      ],
      ' are used to inform\nsearch engines about the focus of your page.',
    ],
    [
      'p',
      {},
      'While ',
      [
        'code',
        {
          className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
          language: 'html',
          style: '',
        },
        [
          'span',
          {
            class: 'sPmlB',
          },
          '<',
        ],
        [
          'span',
          {
            class: 'sbLW1',
          },
          'link',
        ],
        [
          'span',
          {
            class: 'sNAc1',
          },
          ' rel',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '=',
        ],
        [
          'span',
          {
            class: 'sjPTm',
          },
          '"',
        ],
        [
          'span',
          {
            class: 'sXi6O',
          },
          'canonical',
        ],
        [
          'span',
          {
            class: 'sjPTm',
          },
          '"',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '>',
        ],
      ],
      ' and ',
      [
        'code',
        {
          className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
          language: 'html',
          style: '',
        },
        [
          'span',
          {
            class: 'sPmlB',
          },
          '<',
        ],
        [
          'span',
          {
            class: 'sbLW1',
          },
          'meta',
        ],
        [
          'span',
          {
            class: 'sNAc1',
          },
          ' name',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '=',
        ],
        [
          'span',
          {
            class: 'sjPTm',
          },
          '"',
        ],
        [
          'span',
          {
            class: 'sXi6O',
          },
          'robots',
        ],
        [
          'span',
          {
            class: 'sjPTm',
          },
          '"',
        ],
        [
          'span',
          {
            class: 'sPmlB',
          },
          '>',
        ],
      ],
      ' are used to inform search engines about how\nto index your page.',
    ],
    [
      'warning',
      {},
      [
        'p',
        {},
        'A misconfigured canonical URL will result in indexing issues. If you\'re new to SEO, please read the ',
        [
          'a',
          {
            href: 'https://nuxtseo.com/learn/controlling-crawlers',
            rel: [
              'nofollow',
            ],
          },
          'Controlling Web Crawlers',
        ],
        ' guide.',
      ],
    ],
    [
      'code-group',
      {},
      [
        'pre',
        {
          className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
          code: 'import { useHead, useSeoMeta } from \'@unhead/vue\'\n\nuseHead({\n  htmlAttrs: { lang: \'en-US\' }, // BCP 47 language code\n  link: [{\n    rel: \'canonical\',\n    content: \'https://www.example.com/product\'\n  }]\n})\n\nuseSeoMeta({\n  title: \'About Us\',\n  titleTemplate: \'%s -  Site\',\n  description: \'Learn about our awesome site.\',\n})\n',
          filename: 'useHead() + useSeoMeta()',
          language: 'ts',
          meta: 'twoslash',
          style: '',
        },
        [
          'code',
          {
            __ignoreMap: '',
          },
          [
            'span',
            {
              class: 'line',
              line: 1,
            },
            [
              'span',
              {
                class: 'siE8r',
              },
              'import',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' useHead',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' useSeoMeta',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' }',
            ],
            [
              'span',
              {
                class: 'siE8r',
              },
              ' from',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '@unhead/vue',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 2,
            },
            [
              'span',
              {
                emptyLinePlaceholder: true,
              },
              '\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 3,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useHead',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 4,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  htmlAttrs',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' lang',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'en-US',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },',
            ],
            [
              'span',
              {
                class: 'sLCWL',
              },
              ' // BCP 47 language code\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 5,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  link',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 6,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    rel',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'canonical',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 7,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'https://www.example.com/product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 8,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '  }',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ']\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 9,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 10,
            },
            [
              'span',
              {
                emptyLinePlaceholder: true,
              },
              '\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 11,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useSeoMeta',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 12,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  title',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'About Us',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 13,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  titleTemplate',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '%s -  Site',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 14,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  description',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'Learn about our awesome site.',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 15,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
        ],
      ],
      [
        'pre',
        {
          className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
          code: 'import { useHead } from \'@unhead/vue\'\n\nuseHead({\n  htmlAttrs: { lang: \'en-US\' }, // BCP 47 language code\n  title: \'About Us | Company\',\n  titleTemplate: \'%s -  Site\',\n  meta: [\n    {\n      name: \'description\',\n      content: \'Learn how to bake delicious, moist cupcakes with our easy-to-follow guide. Featuring tips and tricks for beginners.\'\n    },\n    // disable indexing with robots \'noindex, nofollow\'\n    { name: \'robots\', content: \'index, follow\' }\n  ],\n  link: [\n    {\n      rel: \'canonical\',\n      content: \'https://www.example.com/product\'\n    }\n  ]\n})\n',
          filename: 'useHead()',
          language: 'ts',
          meta: 'twoslash',
          style: '',
        },
        [
          'code',
          {
            __ignoreMap: '',
          },
          [
            'span',
            {
              class: 'line',
              line: 1,
            },
            [
              'span',
              {
                class: 'siE8r',
              },
              'import',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' useHead',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' }',
            ],
            [
              'span',
              {
                class: 'siE8r',
              },
              ' from',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '@unhead/vue',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 2,
            },
            [
              'span',
              {
                emptyLinePlaceholder: true,
              },
              '\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 3,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useHead',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 4,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  htmlAttrs',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' lang',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'en-US',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },',
            ],
            [
              'span',
              {
                class: 'sLCWL',
              },
              ' // BCP 47 language code\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 5,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  title',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'About Us | Company',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 6,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  titleTemplate',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '%s -  Site',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 7,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  meta',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 8,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 9,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'description',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 10,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'Learn how to bake delicious, moist cupcakes with our easy-to-follow guide. Featuring tips and tricks for beginners.',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 11,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 12,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '    // disable indexing with robots \'noindex, nofollow\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 13,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'robots',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'index, follow',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' }\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 14,
            },
            [
              'span',
              {
                class: 'sjLik',
              },
              '  ]',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 15,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  link',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 16,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 17,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      rel',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'canonical',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 18,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'https://www.example.com/product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 19,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    }\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 20,
            },
            [
              'span',
              {
                class: 'sjLik',
              },
              '  ]\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 21,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
        ],
      ],
    ],
    [
      'h3',
      {
        id: 'optional-seo-tags',
      },
      'Optional SEO Tags',
    ],
    [
      'p',
      {},
      'There are several SEO tags that are generally used but their importance is debated. These tags are not required for\nSEO, but they can be useful in certain situations.',
    ],
    [
      'p',
      {},
      'Please check the other sections for other ',
      [
        'a',
        {
          href: 'https://ogp.me/',
          rel: [
            'nofollow',
          ],
        },
        'open graph',
      ],
      ' tags.',
    ],
    [
      'pre',
      {
        className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
        code: 'useSeoMeta({\n  ogType: \'website\',\n  ogUrl: \'https://www.example.com/product\', // should match canonical URL\n  ogLocale: \'en_US\',\n  ogSiteName: \'My Site\',\n})\n',
        language: 'ts',
        meta: '',
        style: '',
      },
      [
        'code',
        {
          __ignoreMap: '',
        },
        [
          'span',
          {
            class: 'line',
            line: 1,
          },
          [
            'span',
            {
              class: 'sghAj',
            },
            'useSeoMeta',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            '(',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '{\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 2,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  ogType',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'website',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 3,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  ogUrl',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'https://www.example.com/product',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'sLCWL',
            },
            ' // should match canonical URL\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 4,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  ogLocale',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'en_US',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 5,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  ogSiteName',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'My Site',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 6,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '}',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ')\n',
          ],
        ],
      ],
    ],
    [
      'h3',
      {
        id: 'quick-tips',
      },
      'Quick tips',
    ],
    [
      'ul',
      {},
      [
        'li',
        {},
        'Providing ',
        [
          'code',
          {
            className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
            language: 'html',
            style: '',
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '<',
          ],
          [
            'span',
            {
              class: 'sbLW1',
            },
            'meta',
          ],
          [
            'span',
            {
              class: 'sNAc1',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '=',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'keywords',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '>',
          ],
        ],
        ' is no longer recommended by Google.',
      ],
      [
        'li',
        {},
        'Try and avoid duplicate titles and descriptions across your site. If a page is serving the same content, use\n',
        [
          'code',
          {
            className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
            language: 'html',
            style: '',
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '<',
          ],
          [
            'span',
            {
              class: 'sbLW1',
            },
            'link',
          ],
          [
            'span',
            {
              class: 'sNAc1',
            },
            ' rel',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '=',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'canonical',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '>',
          ],
        ],
        ' to inform search engines about the preferred URL.',
      ],
    ],
    [
      'h2',
      {
        id: 'social-share',
      },
      'Social Share',
    ],
    [
      'p',
      {},
      'Social share tags are used to control how your page is displayed when shared on social media platforms. All social share tags are\neither prefixed as ',
      [
        'a',
        {
          href: 'https://ogp.me/',
          rel: [
            'nofollow',
          ],
        },
        'Open Graph',
      ],
      ' or ',
      [
        'a',
        {
          href: 'https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started',
          rel: [
            'nofollow',
          ],
        },
        'Twitter',
      ],
      ' meta tags.',
    ],
    [
      'p',
      {},
      'These tags are commonly duplicated from the existing semantic tags, however, fine-tuning them for each platform\ncan improve the click-through rate of your links.',
    ],
    [
      'code-group',
      {},
      [
        'pre',
        {
          className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
          code: 'useSeoMeta({\n  // title & descriptions\n  ogTitle: \'My Awesome Product\',\n  ogDescription: \'Learn how to bake delicious, moist cupcakes with our easy-to-follow guide. Featuring tips and tricks for beginners.\',\n  twitterTitle: \'My Awesome Product\',\n  twitterDescription: \'Learn how to bake delicious, moist cupcakes with our easy-to-follow guide. Featuring tips and tricks for beginners.\',\n  // no longer explicitly used by X but may be useful for SEO\n  twitterSite: \'@example\',\n  twitterCreator: \'@example\',\n  // og image\n  ogImage: {\n    url: \'https://example.com/og-image.jpg\',\n    width: 1200,\n    height: 600,\n    alt: \'My Awesome Product\',\n    type: \'image/png\'\n  },\n  twitterImage: {\n    url: \'https://example.com/twitter-image.jpg\',\n    width: 1200,\n    height: 600,\n    alt: \'My Awesome Product\',\n    type: \'image/png\'\n  },\n  // twitter image (note: ogImage is used as a fallback so this is optional)\n  twitterCard: \'summary_large_image\', // or summary\n  // used by Slack\n  twitterLabel1: \'Price\',\n  twitterData1: \'$50\',\n  twitterLabel2: \'Read Time\',\n  twitterData2: \'10 min\',\n})\n',
          filename: 'useSeoMeta()',
          language: 'ts',
          meta: 'twoslash',
          style: '',
        },
        [
          'code',
          {
            __ignoreMap: '',
          },
          [
            'span',
            {
              class: 'line',
              line: 1,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useSeoMeta',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 2,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '  // title & descriptions\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 3,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  ogTitle',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'My Awesome Product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 4,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  ogDescription',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'Learn how to bake delicious, moist cupcakes with our easy-to-follow guide. Featuring tips and tricks for beginners.',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 5,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterTitle',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'My Awesome Product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 6,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterDescription',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'Learn how to bake delicious, moist cupcakes with our easy-to-follow guide. Featuring tips and tricks for beginners.',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 7,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '  // no longer explicitly used by X but may be useful for SEO\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 8,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterSite',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '@example',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 9,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterCreator',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '@example',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 10,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '  // og image\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 11,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  ogImage',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 12,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    url',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'https://example.com/og-image.jpg',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 13,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    width',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 1200',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 14,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    height',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 600',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 15,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    alt',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'My Awesome Product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 16,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    type',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'image/png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 17,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '  },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 18,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterImage',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 19,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    url',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'https://example.com/twitter-image.jpg',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 20,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    width',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 1200',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 21,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    height',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 600',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 22,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    alt',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'My Awesome Product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 23,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '    type',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'image/png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 24,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '  },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 25,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '  // twitter image (note: ogImage is used as a fallback so this is optional)\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 26,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterCard',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'summary_large_image',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'sLCWL',
              },
              ' // or summary\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 27,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '  // used by Slack\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 28,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterLabel1',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'Price',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 29,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterData1',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '$50',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 30,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterLabel2',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'Read Time',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 31,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  twitterData2',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '10 min',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 32,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
        ],
      ],
      [
        'pre',
        {
          className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
          code: 'useSeoMeta({\n  ogImage: [\n    {\n      url: \'https://www.example.com/image1.png\',\n      alt: \'My Awesome Product\',\n      width: 1200,\n      height: 630,\n      type: \'image/png\'\n    },\n    {\n      url: \'https://www.example.com/image2.png\',\n      alt: \'My Awesome Product\',\n      width: 1200,\n      height: 630,\n      type: \'image/png\'\n    }\n  ]\n})\n',
          filename: 'Multiple Images',
          language: 'ts',
          meta: '',
          style: '',
        },
        [
          'code',
          {
            __ignoreMap: '',
          },
          [
            'span',
            {
              class: 'line',
              line: 1,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useSeoMeta',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 2,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  ogImage',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 3,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 4,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      url',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'https://www.example.com/image1.png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 5,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      alt',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'My Awesome Product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 6,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      width',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 1200',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 7,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      height',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 630',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 8,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      type',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'image/png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 9,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 10,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 11,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      url',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'https://www.example.com/image2.png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 12,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      alt',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'My Awesome Product',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 13,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      width',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 1200',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 14,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      height',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sexE7',
              },
              ' 630',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 15,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '      type',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'image/png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 16,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    }\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 17,
            },
            [
              'span',
              {
                class: 'sjLik',
              },
              '  ]\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 18,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
        ],
      ],
    ],
    [
      'h3',
      {
        id: 'quick-tips-1',
      },
      'Quick tips',
    ],
    [
      'ul',
      {},
      [
        'li',
        {},
        'Most sites only need the ',
        [
          'code',
          {
            className: 'language-html shiki shiki-themes github-light github-light material-theme-palenight',
            language: 'html',
            style: '',
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '<',
          ],
          [
            'span',
            {
              class: 'sbLW1',
            },
            'meta',
          ],
          [
            'span',
            {
              class: 'sNAc1',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '=',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'twitter:card',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '"',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '>',
          ],
        ],
        ' Twitter tag as the Open Graph tags are used as a fallback.',
      ],
      [
        'li',
        {},
        'Try and make titles and descriptions relevant in the context of people sharing your page.',
      ],
    ],
    [
      'h2',
      {
        id: 'blog-posts',
      },
      'Blog Posts',
    ],
    [
      'p',
      {},
      'Blog posts are a common use case for more advanced SEO tags. These tags can provide more semantic meaning to your page and help search engines\nunderstand the content of your page better.',
    ],
    [
      'p',
      {},
      'Make sure to combine these tags with the ',
      [
        'a',
        {
          href: '#seo-starter',
        },
        'SEO Starter',
      ],
      ' and ',
      [
        'a',
        {
          href: '#social-share',
        },
        'Social Share',
      ],
      ' sections for a more complete solution.',
    ],
    [
      'pre',
      {
        className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
        code: 'import { useSeoMeta } from \'@unhead/vue\'\n\nuseSeoMeta({\n  ogType: \'article\',\n  articlePublishedTime: \'2023-04-01T12:00:00Z\',\n  articleModifiedTime: \'2023-05-10T14:45:00Z\',\n  articleAuthor: \'John Doe\',\n  articleSection: \'Technology\', // category\n  articleTag: [\'JavaScript\'],\n  twitterLabel1: \'Author\',\n  twitterData1: \'John Doe\',\n  twitterLabel2: \'Read Time\',\n  twitterData2: \'10 min\',\n})\n\n// link to previous and next posts\nuseHead({\n  link: [\n    { rel: \'prev\', href: \'https://site.com/blog/previous\' },\n    { rel: \'next\', href: \'https://site.com/blog/next\' }\n  ]\n})\n',
        language: 'ts',
        meta: 'twoslash',
        style: '',
      },
      [
        'code',
        {
          __ignoreMap: '',
        },
        [
          'span',
          {
            class: 'line',
            line: 1,
          },
          [
            'span',
            {
              class: 'siE8r',
            },
            'import',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' {',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ' useSeoMeta',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' }',
          ],
          [
            'span',
            {
              class: 'siE8r',
            },
            ' from',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '@unhead/vue',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 2,
          },
          [
            'span',
            {
              emptyLinePlaceholder: true,
            },
            '\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 3,
          },
          [
            'span',
            {
              class: 'sghAj',
            },
            'useSeoMeta',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            '(',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '{\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 4,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  ogType',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'article',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 5,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  articlePublishedTime',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '2023-04-01T12:00:00Z',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 6,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  articleModifiedTime',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '2023-05-10T14:45:00Z',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 7,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  articleAuthor',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'John Doe',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 8,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  articleSection',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'Technology',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'sLCWL',
            },
            ' // category\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 9,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  articleTag',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ' [',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'JavaScript',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ']',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 10,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  twitterLabel1',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'Author',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 11,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  twitterData1',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'John Doe',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 12,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  twitterLabel2',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'Read Time',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 13,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  twitterData2',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '10 min',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 14,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '}',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ')\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 15,
          },
          [
            'span',
            {
              emptyLinePlaceholder: true,
            },
            '\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 16,
          },
          [
            'span',
            {
              class: 'sLCWL',
            },
            '// link to previous and next posts\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 17,
          },
          [
            'span',
            {
              class: 'sghAj',
            },
            'useHead',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            '(',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '{\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 18,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  link',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ' [\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 19,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' rel',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'prev',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' href',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'https://site.com/blog/previous',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' },\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 20,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' rel',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'next',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' href',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'https://site.com/blog/next',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' }\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 21,
          },
          [
            'span',
            {
              class: 'sjLik',
            },
            '  ]\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 22,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '}',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ')\n',
          ],
        ],
      ],
    ],
    [
      'h3',
      {
        id: 'quick-tips-2',
      },
      'Quick tips',
    ],
    [
      'ul',
      {},
      [
        'li',
        {},
        'Combine it with ',
        [
          'a',
          {
            href: '/docs/schema-org/recipes/blog',
          },
          'BlogPosting',
        ],
        ' Schema.org to provide more semantic meaning to your page.',
      ],
    ],
    [
      'h2',
      {
        id: 'icons-colors',
      },
      'Icons & Colors',
    ],
    [
      'p',
      {},
      'There are several tags you can use to control how your site is displayed in the browser. These tags are not required for SEO, but they can be useful in certain situations.',
    ],
    [
      'code-group',
      {},
      [
        'pre',
        {
          className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
          code: 'import { useHead } from \'@unhead/vue\'\n\nuseHead({\n  link: [\n    { rel: \'icon\', href: \'/favicon.ico\', sizes: \'any\' },\n    { rel: \'icon\', href: \'/favicon.svg\', sizes: \'any\', type: \'image/svg+xml\' },\n    { rel: \'apple-touch-icon\', sizes: \'180x180\', href: \'/apple-touch-icon.png\' },\n  ],\n  meta: [\n    // used on some mobile browsers\n    { name: \'theme-color\', content: \'#0000FF\' },\n    // choose light or dark (or both, see Light + Dark Mode)\n    { name: \'color-scheme\', content: \'light dark\' },\n  ]\n})\n',
          filename: 'Simple',
          language: 'ts',
          meta: 'twoslash',
          style: '',
        },
        [
          'code',
          {
            __ignoreMap: '',
          },
          [
            'span',
            {
              class: 'line',
              line: 1,
            },
            [
              'span',
              {
                class: 'siE8r',
              },
              'import',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' useHead',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' }',
            ],
            [
              'span',
              {
                class: 'siE8r',
              },
              ' from',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '@unhead/vue',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 2,
            },
            [
              'span',
              {
                emptyLinePlaceholder: true,
              },
              '\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 3,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useHead',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 4,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  link',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 5,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' rel',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'icon',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' href',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '/favicon.ico',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' sizes',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'any',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 6,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' rel',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'icon',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' href',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '/favicon.svg',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' sizes',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'any',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' type',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'image/svg+xml',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 7,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' rel',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'apple-touch-icon',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' sizes',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '180x180',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' href',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '/apple-touch-icon.png',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 8,
            },
            [
              'span',
              {
                class: 'sjLik',
              },
              '  ]',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 9,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  meta',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 10,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '    // used on some mobile browsers\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 11,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'theme-color',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'svNf9',
              },
              '#0000FF',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 12,
            },
            [
              'span',
              {
                class: 'sLCWL',
              },
              '    // choose light or dark (or both, see Light + Dark Mode)\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 13,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'color-scheme',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'light dark',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 14,
            },
            [
              'span',
              {
                class: 'sjLik',
              },
              '  ]\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 15,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
        ],
      ],
      [
        'pre',
        {
          className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
          code: 'import { useHead } from \'@unhead/vue\'\n\nuseHead({\n  meta: [\n    { name: \'theme-color\', content: \'#0000FF\', media: \'(prefers-color-scheme: light)\' },\n    { name: \'theme-color\', content: \'#000000\', media: \'(prefers-color-scheme: dark)\' },\n    { name: \'color-scheme\', content: \'light dark\' }\n  ]\n})\n',
          filename: 'Light + Dark Mode',
          language: 'ts',
          meta: '',
          style: '',
        },
        [
          'code',
          {
            __ignoreMap: '',
          },
          [
            'span',
            {
              class: 'line',
              line: 1,
            },
            [
              'span',
              {
                class: 'siE8r',
              },
              'import',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' {',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' useHead',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' }',
            ],
            [
              'span',
              {
                class: 'siE8r',
              },
              ' from',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '@unhead/vue',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 2,
            },
            [
              'span',
              {
                emptyLinePlaceholder: true,
              },
              '\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 3,
            },
            [
              'span',
              {
                class: 'sghAj',
              },
              'useHead',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              '(',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              '{\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 4,
            },
            [
              'span',
              {
                class: 'srsTz',
              },
              '  meta',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ' [\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 5,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'theme-color',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'svNf9',
              },
              '#0000FF',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' media',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '(prefers-color-scheme: light)',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 6,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'theme-color',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 's1V6C',
              },
              '#000000',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' media',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              '(prefers-color-scheme: dark)',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' },\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 7,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '    {',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' name',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'color-scheme',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ',',
            ],
            [
              'span',
              {
                class: 'srsTz',
              },
              ' content',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ':',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              ' \'',
            ],
            [
              'span',
              {
                class: 'sXi6O',
              },
              'light dark',
            ],
            [
              'span',
              {
                class: 'sjPTm',
              },
              '\'',
            ],
            [
              'span',
              {
                class: 'sPmlB',
              },
              ' }\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 8,
            },
            [
              'span',
              {
                class: 'sjLik',
              },
              '  ]\n',
            ],
          ],
          [
            'span',
            {
              class: 'line',
              line: 9,
            },
            [
              'span',
              {
                class: 'sPmlB',
              },
              '}',
            ],
            [
              'span',
              {
                class: 'sjLik',
              },
              ')\n',
            ],
          ],
        ],
      ],
    ],
    [
      'h3',
      {
        id: 'quick-tips-3',
      },
      'Quick tips',
    ],
    [
      'ul',
      {},
      [
        'li',
        {},
        'Using a favion.ico packed with multiple sizes is best practice. You can use ',
        [
          'a',
          {
            href: 'https://realfavicongenerator.net/',
            rel: [
              'nofollow',
            ],
          },
          'RealFaviconGenerator',
        ],
        ' to generate a favicon.ico file with multiple sizes.',
      ],
      [
        'li',
        {},
        'Using an SVG icon is useful, but it may cause issues with some browsers.',
      ],
    ],
    [
      'h2',
      {
        id: 'pwa',
      },
      'PWA',
    ],
    [
      'p',
      {},
      'Progressive Web Apps (PWAs) are a set of best practices for building web apps that work offline and provide a native app-like experience.',
    ],
    [
      'pre',
      {
        className: 'language-ts shiki shiki-themes github-light github-light material-theme-palenight',
        code: 'import { useHead } from \'@unhead/vue\'\n\nuseHead({\n  link: [\n    { rel: \'manifest\', href: \'/manifest.json\' },\n    { rel: \'apple-touch-icon\', href: \'/apple-touch-icon.png\' }\n  ],\n  meta: [\n    { name: \'viewport\', content: \'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover\' },\n    { name: \'theme-color\', content: \'#0000FF\' },\n    { name: \'apple-mobile-web-app-capable\', content: \'yes\' },\n    { name: \'apple-mobile-web-app-status-bar-style\', content: \'default\' }\n  ]\n})\n',
        language: 'ts',
        meta: 'twoslash',
        style: '',
      },
      [
        'code',
        {
          __ignoreMap: '',
        },
        [
          'span',
          {
            class: 'line',
            line: 1,
          },
          [
            'span',
            {
              class: 'siE8r',
            },
            'import',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' {',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ' useHead',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' }',
          ],
          [
            'span',
            {
              class: 'siE8r',
            },
            ' from',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '@unhead/vue',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 2,
          },
          [
            'span',
            {
              emptyLinePlaceholder: true,
            },
            '\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 3,
          },
          [
            'span',
            {
              class: 'sghAj',
            },
            'useHead',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            '(',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            '{\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 4,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  link',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ' [\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 5,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' rel',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'manifest',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' href',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '/manifest.json',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' },\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 6,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' rel',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'apple-touch-icon',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' href',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            '/apple-touch-icon.png',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' }\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 7,
          },
          [
            'span',
            {
              class: 'sjLik',
            },
            '  ]',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 8,
          },
          [
            'span',
            {
              class: 'srsTz',
            },
            '  meta',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ' [\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 9,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'viewport',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' content',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' },\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 10,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'theme-color',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' content',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'svNf9',
            },
            '#0000FF',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' },\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 11,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'apple-mobile-web-app-capable',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' content',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'yes',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' },\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 12,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '    {',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' name',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'apple-mobile-web-app-status-bar-style',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ',',
          ],
          [
            'span',
            {
              class: 'srsTz',
            },
            ' content',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ':',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            ' \'',
          ],
          [
            'span',
            {
              class: 'sXi6O',
            },
            'default',
          ],
          [
            'span',
            {
              class: 'sjPTm',
            },
            '\'',
          ],
          [
            'span',
            {
              class: 'sPmlB',
            },
            ' }\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 13,
          },
          [
            'span',
            {
              class: 'sjLik',
            },
            '  ]\n',
          ],
        ],
        [
          'span',
          {
            class: 'line',
            line: 14,
          },
          [
            'span',
            {
              class: 'sPmlB',
            },
            '}',
          ],
          [
            'span',
            {
              class: 'sjLik',
            },
            ')\n',
          ],
        ],
      ],
    ],
    [
      'style',
      {},
      'html pre.shiki code .sPmlB, html code.shiki .sPmlB{--shiki-light:#24292E;--shiki-default:#24292E;--shiki-dark:#89DDFF}html pre.shiki code .sbLW1, html code.shiki .sbLW1{--shiki-light:#22863A;--shiki-default:#22863A;--shiki-dark:#F07178}html .light .shiki span {color: var(--shiki-light);background: var(--shiki-light-bg);font-style: var(--shiki-light-font-style);font-weight: var(--shiki-light-font-weight);text-decoration: var(--shiki-light-text-decoration);}html.light .shiki span {color: var(--shiki-light);background: var(--shiki-light-bg);font-style: var(--shiki-light-font-style);font-weight: var(--shiki-light-font-weight);text-decoration: var(--shiki-light-text-decoration);}html .default .shiki span {color: var(--shiki-default);background: var(--shiki-default-bg);font-style: var(--shiki-default-font-style);font-weight: var(--shiki-default-font-weight);text-decoration: var(--shiki-default-text-decoration);}html .shiki span {color: var(--shiki-default);background: var(--shiki-default-bg);font-style: var(--shiki-default-font-style);font-weight: var(--shiki-default-font-weight);text-decoration: var(--shiki-default-text-decoration);}html .dark .shiki span {color: var(--shiki-dark);background: var(--shiki-dark-bg);font-style: var(--shiki-dark-font-style);font-weight: var(--shiki-dark-font-weight);text-decoration: var(--shiki-dark-text-decoration);}html.dark .shiki span {color: var(--shiki-dark);background: var(--shiki-dark-bg);font-style: var(--shiki-dark-font-style);font-weight: var(--shiki-dark-font-weight);text-decoration: var(--shiki-dark-text-decoration);}html pre.shiki code .sNAc1, html code.shiki .sNAc1{--shiki-light:#6F42C1;--shiki-default:#6F42C1;--shiki-dark:#C792EA}html pre.shiki code .sjPTm, html code.shiki .sjPTm{--shiki-light:#032F62;--shiki-default:#032F62;--shiki-dark:#89DDFF}html pre.shiki code .sXi6O, html code.shiki .sXi6O{--shiki-light:#032F62;--shiki-default:#032F62;--shiki-dark:#C3E88D}html pre.shiki code .sghAj, html code.shiki .sghAj{--shiki-light:#6F42C1;--shiki-default:#6F42C1;--shiki-dark:#82AAFF}html pre.shiki code .sjLik, html code.shiki .sjLik{--shiki-light:#24292E;--shiki-default:#24292E;--shiki-dark:#BABED8}html pre.shiki code .srsTz, html code.shiki .srsTz{--shiki-light:#24292E;--shiki-default:#24292E;--shiki-dark:#F07178}html pre.shiki code .sLCWL, html code.shiki .sLCWL{--shiki-light:#6A737D;--shiki-light-font-style:inherit;--shiki-default:#6A737D;--shiki-default-font-style:inherit;--shiki-dark:#676E95;--shiki-dark-font-style:italic}html pre.shiki code .sexE7, html code.shiki .sexE7{--shiki-light:#005CC5;--shiki-default:#005CC5;--shiki-dark:#F78C6C}html pre.shiki code .siE8r, html code.shiki .siE8r{--shiki-light:#D73A49;--shiki-light-font-style:inherit;--shiki-default:#D73A49;--shiki-default-font-style:inherit;--shiki-dark:#89DDFF;--shiki-dark-font-style:italic}html pre.shiki code .svNf9, html code.shiki .svNf9{background-color:#0000FF;color:#ffffff;display:inline-block;padding:0 0.15em;margin:0 -0.15em;border-radius:0.2em}html pre.shiki code .s1V6C, html code.shiki .s1V6C{background-color:#000000;color:#ffffff;display:inline-block;padding:0 0.15em;margin:0 -0.15em;border-radius:0.2em}',
    ],
  ],
  toc: {
    title: '',
    searchDepth: 2,
    depth: 2,
    links: [
      {
        id: 'introduction',
        depth: 2,
        text: 'Introduction',
        children: [
          {
            id: 'defaults',
            depth: 3,
            text: 'Defaults',
          },
        ],
      },
      {
        id: 'seo-starter',
        depth: 2,
        text: 'SEO Starter',
        children: [
          {
            id: 'optional-seo-tags',
            depth: 3,
            text: 'Optional SEO Tags',
          },
          {
            id: 'quick-tips',
            depth: 3,
            text: 'Quick tips',
          },
        ],
      },
      {
        id: 'social-share',
        depth: 2,
        text: 'Social Share',
        children: [
          {
            id: 'quick-tips-1',
            depth: 3,
            text: 'Quick tips',
          },
        ],
      },
      {
        id: 'blog-posts',
        depth: 2,
        text: 'Blog Posts',
        children: [
          {
            id: 'quick-tips-2',
            depth: 3,
            text: 'Quick tips',
          },
        ],
      },
      {
        id: 'icons-colors',
        depth: 2,
        text: 'Icons & Colors',
        children: [
          {
            id: 'quick-tips-3',
            depth: 3,
            text: 'Quick tips',
          },
        ],
      },
      {
        id: 'pwa',
        depth: 2,
        text: 'PWA',
      },
    ],
  },
}

describe('runtime content transforms', () => {
  it('should transform code blocks', () => {
    replaceImportSpecifier(
      payload.value,
      '@unhead/vue',
      '@unhead/react',
    )
    const payloadJson = JSON.stringify(payload.value)
    expect(payloadJson).not.toMatch(/@unhead\/vue/g)
  })
})
