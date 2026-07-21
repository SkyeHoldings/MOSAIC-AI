import { Link } from 'react-router-dom'
import type { CaseStudy } from '../data/work'
import { PhoneCollage } from './PhoneCollage'

type Props = {
  study: CaseStudy
}

export function WorkCard({ study }: Props) {
  const hasCollage = Boolean(study.tileCollage?.length)
  const hasImages = Boolean(study.tileImages?.length)
  const hasImage = Boolean(study.tileImage)

  const caption = (
    <div className="work-card__caption">
      <div className="work-card__client">{study.client}</div>
      <h2 className="work-card__title">{study.title}</h2>
    </div>
  )

  const media = (
    <div
      className={[
        'work-card__media',
        hasCollage ? 'has-collage' : '',
        hasImages ? 'has-images' : '',
        hasImage && !hasCollage && !hasImages ? 'has-image' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        hasCollage || hasImages || hasImage
          ? undefined
          : { ['--tile-bg' as string]: study.tileBg }
      }
      aria-hidden="true"
    >
      {hasCollage ? (
        <PhoneCollage images={study.tileCollage!} />
      ) : hasImages ? (
        <div
          className={`work-card__strip work-card__strip--${study.tileImages!.length}`}
        >
          {study.tileImages!.map((src) => (
            <img key={src} src={src} alt="" loading="lazy" />
          ))}
        </div>
      ) : hasImage ? (
        <img
          className="work-card__image"
          src={study.tileImage}
          alt=""
          loading="lazy"
        />
      ) : null}
    </div>
  )

  return (
    <Link
      to={`/work/${study.id}`}
      className={`work-card${study.wide ? ' is-wide caption-top' : ''}`}
    >
      {study.wide ? (
        <>
          {caption}
          {media}
        </>
      ) : (
        <>
          {media}
          {caption}
        </>
      )}
    </Link>
  )
}
