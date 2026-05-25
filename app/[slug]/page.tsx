import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, categories, pageMetadata, siteName } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

function findCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) return {};

  return pageMetadata({
    title: category.title,
    description: category.description,
    path: `/${category.slug}`,
    keywords: category.keywords
  });
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: category.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteName,
        item: absoluteUrl("/")
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.title,
        item: absoluteUrl(`/${category.slug}`)
      }
    ]
  };

  return (
    <section className="stack">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="hero compact-hero">
        <p className="kicker">{category.kicker}</p>
        <h1>{category.h1}</h1>
        <p className="subtitle">{category.description}</p>
        <div className="cta-row">
          <Link className="button" href="/play">
            Play today&apos;s quiz
          </Link>
        </div>
      </div>

      <section className="panel stack">
        <p className="muted lead-copy">{category.intro}</p>
        <div className="feature-grid">
          {category.sections.map((section) => (
            <div key={section.heading}>
              <strong>{section.heading}</strong>
              <span>{section.body}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel stack" aria-labelledby="faq-heading">
        <p className="kicker">Quick answers</p>
        <h2 id="faq-heading">{category.title} FAQ</h2>
        {category.faq.map((item) => (
          <div className="faq-item" key={item.question}>
            <h3>{item.question}</h3>
            <p className="muted">{item.answer}</p>
          </div>
        ))}
      </section>
    </section>
  );
}
