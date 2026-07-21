import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/** Pack screens into N equal columns so the panel fills with no black voids. */
export function ShopCollage({
  columns,
  children,
}: {
  columns: number
  children: ReactNode[]
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [inColor, setInColor] = useState(false)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInColor(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const cols: ReactNode[][] = Array.from({ length: columns }, () => [])
  children.forEach((child, index) => {
    cols[index % columns]?.push(child)
  })

  return (
    <div
      ref={rootRef}
      className={`phone-collage phone-collage--columns phone-collage--fit${inColor ? ' is-color' : ''}`}
      style={{ '--collage-cols': columns } as CSSProperties}
      aria-hidden="true"
    >
      {cols.map((items, colIndex) => (
        <div key={colIndex} className="phone-collage__col">
          {items}
        </div>
      ))}
    </div>
  )
}
