import { type CSSProperties, type ReactNode } from 'react'

/** Pack screens into N equal columns so the panel fills with no black voids. */
export function ShopCollage({
  columns,
  children,
}: {
  columns: number
  children: ReactNode[]
}) {
  const cols: ReactNode[][] = Array.from({ length: columns }, () => [])
  children.forEach((child, index) => {
    cols[index % columns]?.push(child)
  })

  return (
    <div
      className="phone-collage phone-collage--columns phone-collage--fit"
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
