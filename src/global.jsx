import '@/styles'

import Content from "@/layouts/Content"
import Footer from "@/layouts/Footer"
import Header from "@/layouts/Header"
import { Head } from "minista"
import Navigation from './layouts/Navigation'

export default function (props) {
    const {
        children,
        title,
        url,
        description,
        ogImage,
        ogType = 'website',
        canonical,
        noindex,
        redirectTo,
    } = props
    const isCatalogPage = /catalog/i.test(url || '')
    const metaDescription = description || 'Агентство недвижимости «Город» в Воткинске: покупка, продажа и сопровождение сделок с недвижимостью.'

  return (
    <>
      <Head htmlAttributes={{ lang: 'ru' }}>
        <title>gorod | {title}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`gorod | ${title}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content={ogType} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {redirectTo && <meta httpEquiv="refresh" content={`0; url=${redirectTo}`} />}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        <script src="/src/main.js" type="module"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>  
      {!isCatalogPage && (
        <div className="site-bg" aria-hidden="true">
          <span className="site-bg__word">ГОРОД</span>
          <span className="site-bg__vertical">недвижимость</span>
        </div>
      )}
      <Header />
      <Navigation />
      <Content>
        {children}
      </Content>
      <Footer />
    </>
  )
}
