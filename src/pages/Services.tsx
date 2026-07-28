import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContactSection } from '../components/ContactSection'

type MonthlyService = {
  id: string
  number: string
  title: string
  tagline: string
  price: string
  body: string
  includes: string[]
}

type ProjectService = {
  id: string
  number: string
  title: string
  body: string
  detail: string
}

type FitGuide = {
  number: string
  situation: string
  recommendation: string
  body: string
}

type FaqItem = {
  question: string
  answer: string
}

const monthlyServices: MonthlyService[] = [
  {
    id: 'content',
    number: '01',
    title: 'MOSAIC Content',
    tagline: 'For businesses that need to look active, premium, and trusted every month.',
    price: '$3,000 / month',
    body: 'Monthly content production built around the way your business needs to show up. We plan, shoot, and create the video, photo, and social assets that keep your brand visible and credible.',
    includes: [
      'Short-form video production',
      'Photography',
      'Static creative',
      'Content strategy',
      'Creative direction',
      'Posting schedule',
      'Client portal and reporting',
    ],
  },
  {
    id: 'ads',
    number: '02',
    title: 'MOSAIC Ads',
    tagline: 'For businesses that need to turn attention into real inquiries.',
    price: '$2,500 / month',
    body: 'Ad campaigns built around your offer, your market, and the creative needed to get people to stop, understand, and take action.',
    includes: [
      'Meta and Google campaign management',
      'Video ad creative',
      'Audience & targeting strategy',
      'Creative testing',
      'Weekly reporting',
      'Monthly strategy call',
    ],
  },
  {
    id: 'content-ads',
    number: '03',
    title: 'MOSAIC Content + Ads',
    tagline:
      'For businesses ready to build visibility and turn it into consistent inbound demand.',
    price: '$4,000 / month',
    body: 'This is the strongest monthly system. Content builds trust. Ads put that trust in front of more people. Both are built by the same team, around the same strategy, with one clear creative direction.',
    includes: [
      'Everything in MOSAIC Content',
      'Ad creative and campaign management',
      'Lead automation software install',
      'Daily lead notifications',
      'Weekly reporting',
      'Monthly strategy calls',
    ],
  },
]

const projectServices: ProjectService[] = [
  {
    id: 'web',
    number: '01',
    title: 'Web Design',
    body: 'A clean, fast, conversion-focused website that makes your business easier to trust and easier to choose.',
    detail:
      'Homepage, service pages, landing pages, lead forms, mobile structure, and tracking setup.',
  },
  {
    id: 'brand',
    number: '02',
    title: 'Brand Launch',
    body: 'Positioning, visual identity, and messaging built to make your business look like exactly what it is.',
    detail:
      'Brand direction, messaging, visual system, launch strategy, and core creative assets.',
  },
  {
    id: 'film',
    number: '03',
    title: 'Film Production',
    body: 'Cinematic brand films and campaign content built to make people feel something before they decide anything.',
    detail:
      'Hero films, campaign videos, founder stories, launch films, and premium video assets.',
  },
  {
    id: 'photo',
    number: '04',
    title: 'Photo Production',
    body: 'A full shoot day producing premium brand imagery your business can use across every touchpoint.',
    detail:
      'Website imagery, social assets, ad visuals, team photos, product moments, and campaign stills.',
  },
]

const fitGuides: FitGuide[] = [
  {
    number: '01',
    situation: 'If people already trust you, but not enough people see you',
    recommendation: 'Start with MOSAIC Ads',
    body: 'Paid campaigns built to put the right offer in front of the right people and turn attention into real inquiries.',
  },
  {
    number: '02',
    situation: 'If people know you exist, but your brand does not feel consistent',
    recommendation: 'Start with MOSAIC Content',
    body: 'Monthly creative built to make your business look active, credible, and worth paying attention to.',
  },
  {
    number: '03',
    situation: 'If you need visibility and leads working together',
    recommendation: 'Start with MOSAIC Content + Ads',
    body: 'Content builds trust. Ads put that trust in front of more of the right people — one strategy, one creative direction.',
  },
  {
    number: '04',
    situation:
      'If you need to build a good brand foundation before thinking about ads and content',
    recommendation: 'Start with a One-Time Build',
    body: 'Website, brand, film, or photo projects built to give your business a stronger base before ongoing marketing.',
  },
]

const faqs: FaqItem[] = [
  {
    question: 'Do we need content, ads, or both?',
    answer:
      'If your business already looks strong online and people understand your offer quickly, ads may be the fastest lever. If your presence feels inconsistent or unclear, content usually needs to come first. If you need both visibility and better lead flow, Content + Ads is the strongest fit.',
  },
  {
    question: 'What is the difference between MOSAIC Content and MOSAIC Ads?',
    answer:
      'MOSAIC Content is built to help your business show up consistently, look credible, and build trust over time. MOSAIC Ads is built to put a clear offer in front of the right people and turn attention into inquiries. One builds presence. The other drives traffic. Together, they work better.',
  },
  {
    question: "What's the best monthly option?",
    answer:
      'Content + Ads is the strongest monthly system when you need both consistency and inbound demand. Content builds trust; ads put that trust in front of more of the right people — same team, same strategy, one creative direction.',
  },
  {
    question: 'Do you handle strategy, or just production?',
    answer:
      'Strategy is built into everything. We are not here to create random videos, graphics, or campaigns. We look at what your market needs to see, understand, and believe before they choose you, then build the creative around that.',
  },
  {
    question: 'Can you build the website too?',
    answer:
      'Yes. If your website is hurting trust, clarity, or conversions, we can build that foundation before or alongside content and ads. A stronger website makes every campaign, post, and inquiry work harder.',
  },
  {
    question: 'What kinds of businesses is this best for?',
    answer:
      'MOSAIC is best for businesses where trust affects the sale — restaurants, hospitality, professional services, wellness, retail, and local brands across the Inland Northwest that need to look credible before someone reaches out.',
  },
  {
    question: 'What if we only need one project right now?',
    answer:
      'That is what One-Time Builds are for. If you need a website, brand launch, film, or photo library before stepping into ongoing marketing, we can start there. Not every business needs a monthly system on day one.',
  },
  {
    question: 'How fast can we start?',
    answer:
      'Monthly partnerships usually begin with strategy, onboarding, and production planning. Ads can move quickly when the offer, website, and creative direction are clear. Project timelines depend on the scope, but the goal is always to get the right work moving without dragging the process out.',
  },
  {
    question: 'Do you post the content for us?',
    answer:
      'That depends on the service level. Some partnerships include planning and asset delivery, while higher-level monthly support can include posting and ongoing optimization. We will recommend the setup that makes the most sense for your team.',
  },
]

function Pill({ children }: { children: string }) {
  return (
    <p className="svc-pill">
      <span className="svc-pill__dot" aria-hidden="true" />
      {children}
      <span className="svc-pill__dot" aria-hidden="true" />
    </p>
  )
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const baseId = useId()

  return (
    <div className="svc-faq__list">
      {items.map((item, index) => {
        const open = openIndex === index
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-btn-${index}`
        const number = String(index + 1).padStart(2, '0')

        return (
          <div key={item.question} className={`svc-faq__item${open ? ' is-open' : ''}`}>
            <button
              type="button"
              id={buttonId}
              className="svc-faq__trigger"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className="svc-faq__num">{number}</span>
              <span className="svc-faq__q">{item.question}</span>
              <span className="svc-faq__icon" aria-hidden="true">
                {open ? '−' : '+'}
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="svc-faq__panel"
              hidden={!open}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function Services() {
  return (
    <div className="svc">
      <section className="svc-hero" aria-labelledby="svc-hero-heading">
        <div className="svc-hero__inner">
          <Pill>Services</Pill>
          <h1 id="svc-hero-heading">Creative and strategic services for brand growth.</h1>
          <p>
            Content, ads, websites, brand launches, film, and photography built to help your
            business look sharper, communicate clearly, and generate better opportunities.
          </p>
        </div>
      </section>

      <section className="svc-monthly" aria-labelledby="svc-monthly-heading">
        <div className="svc-section-head">
          <Pill>Monthly Services</Pill>
          <h2 id="svc-monthly-heading">Ongoing creative and marketing support.</h2>
          <p>
            For businesses that need consistent visibility, stronger trust, and better inbound
            opportunities.
          </p>
        </div>

        <div className="svc-monthly__list">
          {monthlyServices.map((service) => (
            <article key={service.id} className="svc-plan" id={service.id}>
              <div className="svc-plan__top">
                <p className="svc-plan__num">{service.number}.</p>
                <h3>{service.title}</h3>
                <p className="svc-plan__tagline">{service.tagline}</p>
                <p className="svc-plan__price">{service.price}</p>
                <p className="svc-plan__body">{service.body}</p>
              </div>
              <div className="svc-plan__includes">
                <h4>Includes</h4>
                <ul>
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a className="svc-plan__cta" href="#contact">
                  Get started →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="svc-projects" aria-labelledby="svc-projects-heading">
        <div className="svc-section-head">
          <Pill>Project Based</Pill>
          <h2 id="svc-projects-heading">Start with a project.</h2>
          <p>
            For businesses that need a stronger foundation before they scale visibility, launch
            campaigns, or send more people to their brand.
          </p>
        </div>

        <div className="svc-projects__grid">
          {projectServices.map((project) => (
            <article key={project.id} className="svc-project" id={project.id}>
              <p className="svc-project__num">{project.number}</p>
              <h3>{project.title}</h3>
              <p className="svc-project__body">{project.body}</p>
              <p className="svc-project__detail">{project.detail}</p>
              <a className="svc-project__cta" href="#contact">
                Get started →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="svc-fit" aria-labelledby="svc-fit-heading">
        <div className="svc-section-head">
          <Pill>Find the Right Fit</Pill>
          <h2 id="svc-fit-heading">Not every business needs the same starting point.</h2>
          <p>
            Some businesses need consistency. Some need more qualified traffic. Some need a
            stronger website or brand foundation before more people see them. The right move
            depends on where the biggest gap is right now.
          </p>
        </div>

        <div className="svc-fit__grid">
          {fitGuides.map((guide) => (
            <article key={guide.number} className="svc-fit__card">
              <p className="svc-fit__num">{guide.number}</p>
              <h3>{guide.situation}</h3>
              <p className="svc-fit__label">Recommendation</p>
              <p className="svc-fit__rec">{guide.recommendation}</p>
              <p className="svc-fit__body">{guide.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="svc-faq" aria-labelledby="svc-faq-heading">
        <div className="svc-section-head">
          <Pill>FAQ</Pill>
          <h2 id="svc-faq-heading">Questions before we start.</h2>
          <p>
            The goal is not to sell you the biggest package. The goal is to build the thing that
            gives your business the most leverage next.
          </p>
        </div>
        <FaqAccordion items={faqs} />
      </section>

      <section className="svc-cta" aria-labelledby="svc-cta-heading">
        <h2 id="svc-cta-heading">Let’s build the right starting point.</h2>
        <p>
          Tell us where your business is now, what you’re trying to grow, and which MOSAIC service
          would create the biggest lift first.
        </p>
        <a className="svc-cta__button" href="#contact">
          Get in touch
        </a>
        <p className="svc-cta__alt">
          Or go back to{' '}
          <Link to="/" className="svc-cta__link">
            the home page
          </Link>
          .
        </p>
      </section>

      <ContactSection />
    </div>
  )
}
