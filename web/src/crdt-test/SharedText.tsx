import { useEffect, useState } from 'react'
import * as Y from 'yjs'

export function SharedText({ ydoc }: { ydoc: Y.Doc | null }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!ydoc) return

    const ytext = ydoc.getText('shared-text')

    const update = () => {
      setValue(ytext.toString())
    }

    ytext.observe(update)
    update()

    return () => {
      ytext.unobserve(update)
    }
  }, [ydoc])

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!ydoc) return

    const ytext = ydoc.getText('shared-text')
    ydoc.transact(() => {
      ytext.delete(0, ytext.length)
      ytext.insert(0, e.target.value)
    })
  }

  return <textarea value={value} onChange={onChange} />
}
