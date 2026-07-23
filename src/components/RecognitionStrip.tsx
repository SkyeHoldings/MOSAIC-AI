type RecognitionItem =
  | { id: string; kind: 'eyebrow'; label: string }
  | { id: string; kind: 'award'; mark: string; caption: string }

const items: RecognitionItem[] = [
  { id: 'eyebrow', kind: 'eyebrow', label: 'Previously recognized at dentsu' },
  {
    id: 'google-dentsu',
    kind: 'award',
    mark: 'Google × dentsu',
    caption: 'award',
  },
  { id: 'dentsu', kind: 'award', mark: 'dentsu', caption: 'award' },
]

function RecognitionMark({ item }: { item: RecognitionItem }) {
  if (item.kind === 'eyebrow') {
    return <span className="recognition-strip__eyebrow">{item.label}</span>
  }

  return (
    <span className="recognition-strip__award">
      <span className="recognition-strip__mark">{item.mark}</span>
      <span className="recognition-strip__caption">{item.caption}</span>
    </span>
  )
}

export function RecognitionStrip() {
  // Two identical halves so the -50% marquee loop lands cleanly.
  const loop = [...items, ...items, ...items, ...items]

  return (
    <section className="recognition-strip" aria-label="Awards and recognition">
      <p className="recognition-strip__sr-only">
        Previously recognized at dentsu — Google × dentsu award · dentsu award
      </p>
      <div className="recognition-strip__viewport" aria-hidden="true">
        <div className="recognition-strip__track">
          {loop.map((item, index) => (
            <span className="recognition-strip__item" key={`${item.id}-${index}`}>
              <RecognitionMark item={item} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
