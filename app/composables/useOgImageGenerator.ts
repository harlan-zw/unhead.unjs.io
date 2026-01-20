import { computed, ref, watch } from 'vue'

export function useOgImageGenerator() {
  const title = ref('Unhead')
  const description = ref('The document head manager for Vue and Nuxt.')
  const backgroundColor = ref('#18181b') // zinc-950
  const textColor = ref('#ffffff')
  const width = ref(1200)
  const height = ref(630)

  // Extra fields for advanced templates
  const siteName = ref('Unhead')
  const author = ref('Harlan Wilton')
  const themeColor = ref('#3b82f6') // blue-500
  const logo = ref('https://unhead.unjs.io/logo.svg')
  const productImage = ref('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60')
  const price = ref('$99')
  const brand = ref('Takumi')

  const customCode = ref('')

  // Basic templates
  const templates = {
    simple: (t: string, d: string, bg: string, color: string) => `
export default function OgImage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: '${bg}',
      color: '${color}',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      fontFamily: 'Hubot Sans, sans-serif'
    }}>
      <h1 style={{
        fontSize: '80px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        ${t}
      </h1>
      <p style={{
        fontSize: '40px',
        opacity: 0.8,
        textAlign: 'center',
        maxWidth: '800px'
      }}>
        ${d}
      </p>
    </div>
  )
}
`,
    framed: (t: string, d: string, bg: string, color: string) => `
export default function OgImage() {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: '${bg}',
      padding: '40px',
      fontFamily: 'Hubot Sans, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        border: '4px solid ${color}',
        borderRadius: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        color: '${color}'
      }}>
        <h1 style={{ fontSize: '70px', fontWeight: 'bold' }}>${t}</h1>
        <p style={{ fontSize: '30px', marginTop: '20px' }}>${d}</p>
      </div>
    </div>
  )
}
`,
    blog: (t: string, d: string, bg: string, color: string, extra: any) => `
export default function BlogPostTemplate() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "${bg}",
        color: "${color}",
        backgroundImage: "linear-gradient(135deg, ${bg} 0%, #000 100%)",
        padding: "60px",
        justifyContent: "space-between",
        fontFamily: 'Hubot Sans, sans-serif'
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div
          style={{
            backgroundColor: "${extra.themeColor}",
            color: "white",
            padding: "8px 24px",
            borderRadius: "9999px",
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          ${extra.siteName}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <h1
          style={{
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
            textShadow: "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          ${t}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {${extra.image ? 'true' : 'false'} && (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              overflow: "hidden",
              border: "4px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#333"
            }}
          >
            <img src="${extra.image}" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 32, fontWeight: 600 }}>${extra.author}</span>
          <span style={{ fontSize: 24, color: "#a1a1aa" }}>${new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
`,
    docs: (t: string, d: string, bg: string, color: string, extra: any) => `
export default function DocsTemplate() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "${bg}",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "${color}",
        backgroundImage: "linear-gradient(to bottom right, ${extra.themeColor}, transparent)",
        fontFamily: 'Hubot Sans, sans-serif'
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "60px",
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            marginBottom: "40px",
            textWrap: "pretty",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "${color}",
            }}
          >
            ${t}
          </span>
          <span
            style={{
              fontSize: 44,
              color: "${color}",
              opacity: 0.7,
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: "95%",
              letterSpacing: "-0.01em",
              lineClamp: 2,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            ${d}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {${extra.image ? 'true' : 'false'} && (
             <img src="${extra.image}" width="64" height="64" />
          )}
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "${color}",
              opacity: 0.9,
            }}
          >
            ${extra.siteName}
          </span>
          <div style={{ flexGrow: 1 }} />
          <div
            style={{
              height: 4,
              width: 60,
              backgroundColor: "${extra.themeColor}",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "${extra.themeColor}",
              opacity: 0.8,
            }}
          >
            Documentation
          </span>
        </div>
      </div>
    </div>
  );
}
`,
    product: (t: string, d: string, bg: string, color: string, extra: any) => `
export default function ProductCardTemplate() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "${bg}",
        padding: "40px",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: 'Hubot Sans, sans-serif'
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "white",
          borderRadius: "32px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            flex: 1,
            width: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8fafc",
            backgroundImage: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
            padding: "40px",
            borderTopLeftRadius: "32px",
            borderBottomLeftRadius: "32px",
          }}
        >
          {${extra.image ? 'true' : 'false'} ? (
             <img src="${extra.image}" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
             <div style={{ fontSize: 100 }}>📦</div>
          )}
        </div>
        <div
          style={{
            flex: 1,
            width: "50%",
            display: "flex",
            flexDirection: "column",
            padding: "50px 60px",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: 22,
                color: "#2563eb",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              ${extra.brand}
            </span>
            <span
              style={{
                fontSize: 60,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              ${t}
            </span>
          </div>

          <span
            style={{
              fontSize: 28,
              color: "#475569",
              lineHeight: 1.5,
              marginTop: "24px",
              marginBottom: "32px",
              fontWeight: 400,
            }}
          >
            ${d}
          </span>

          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#2563eb",
            }}
          >
            ${extra.price}
          </div>
        </div>
      </div>
    </div>
  );
}
`,
    code: () => customCode.value,
  }

  const selectedTemplate = ref<keyof typeof templates>('simple')

  watch(selectedTemplate, (newVal, oldVal) => {
    if (newVal === 'code' && oldVal && oldVal !== 'code') {
      const tmpl = templates[oldVal]
      // Select correct image based on template
      let img = logo.value
      if (oldVal === 'product') {
        img = productImage.value
      }

      customCode.value = tmpl(title.value, description.value, backgroundColor.value, textColor.value, {
        siteName: siteName.value,
        author: author.value,
        themeColor: themeColor.value,
        image: img,
        price: price.value,
        brand: brand.value,
      })
    }
  })

  const code = computed(() => {
    const tmpl = templates[selectedTemplate.value]
    // Select correct image based on template
    let img = logo.value
    if (selectedTemplate.value === 'product') {
      img = productImage.value
    }

    return tmpl(title.value, description.value, backgroundColor.value, textColor.value, {
      siteName: siteName.value,
      author: author.value,
      themeColor: themeColor.value,
      image: img,
      price: price.value,
      brand: brand.value,
    })
  })

  // Code for 'useSeoMeta' usage example
  const usageCode = computed(() => {
    return `
useSeoMeta({
  ogImage: [
    {
      url: 'https://example.com/og-image.png',
      width: 1200,
      height: 630,
      alt: '${title.value}',
    }
  ]
})
`
  })

  return {
    title,
    description,
    backgroundColor,
    textColor,
    width,
    height,
    siteName,
    author,
    themeColor,
    logo,
    productImage,
    price,
    brand,
    selectedTemplate,
    templateOptions: Object.keys(templates),
    code,
    customCode,
    usageCode,
  }
}
