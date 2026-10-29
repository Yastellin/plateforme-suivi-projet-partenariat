// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"

const etat = vi.hoisted(() => ({
  onDrop: vi.fn(),
  televerser: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("react-dropzone", () => ({
  useDropzone: (options: { onDrop: (fichiers: File[]) => void }) => {
    etat.onDrop.mockImplementation(options.onDrop)
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({
        type: "file",
        multiple: true,
        onChange: (evenement: React.ChangeEvent<HTMLInputElement>) => {
          options.onDrop(Array.from(evenement.currentTarget.files ?? []))
        },
      }),
      isDragActive: false,
      open: vi.fn(),
    }
  },
}))

vi.mock("@/features/documents/api/useUploadDocument", () => ({
  useUploadDocument: () => ({ isPending: false, mutateAsync: etat.televerser }),
}))

vi.mock("@/components/ui/button", async () => {
  const React = await import("react")
  return {
    Button: ({ children, variant: _variant, size: _size, ...props }: any) =>
      React.createElement("button", props, children),
  }
})

vi.mock("@/components/ui/select", async () => {
  const React = await import("react")
  return {
    Select: ({ value, onValueChange, children }: any) =>
      React.createElement(
        "select",
        { value, onChange: (event: React.ChangeEvent<HTMLSelectElement>) => onValueChange(event.currentTarget.value) },
        children,
      ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => React.createElement(React.Fragment, null, children),
    SelectItem: ({ value, children }: any) => React.createElement("option", { value }, children),
  }
})

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let conteneur: HTMLDivElement
let racine: Root

beforeEach(() => {
  etat.onDrop.mockReset()
  etat.televerser.mockReset().mockResolvedValue(undefined)
  conteneur = document.createElement("div")
  document.body.appendChild(conteneur)
  racine = createRoot(conteneur)
})

afterEach(async () => {
  await act(async () => racine.unmount())
  conteneur.remove()
})

describe("zone de téléversement des documents", () => {
  it("permet de choisir et d’afficher plusieurs documents avant création", async () => {
    const documentsPrets = vi.fn()
    await act(async () => {
      racine.render(
        createElement(DocumentDropzone, {
          modePreparation: true,
          onDocumentPret: documentsPrets,
        }),
      )
    })

    const fichierA = new File(["contenu"], "annexe-a.pdf", { type: "application/pdf", lastModified: 1 })
    const fichierB = new File(["contenu"], "annexe-b.pdf", { type: "application/pdf", lastModified: 2 })
    const champFichiers = conteneur.querySelector<HTMLInputElement>('input[type="file"]')!
    Object.defineProperty(champFichiers, "files", { value: [fichierA, fichierB] })

    await act(async () => {
      champFichiers.dispatchEvent(new Event("change", { bubbles: true }))
    })

    expect(conteneur.textContent).toContain("annexe-a.pdf")
    expect(conteneur.textContent).toContain("annexe-b.pdf")
    expect(conteneur.textContent).toContain("Ces documents seront téléversés après la création de l’entité.")
    expect(documentsPrets).toHaveBeenLastCalledWith([
      { fichier: fichierA, type: "AUTRE" },
      { fichier: fichierB, type: "AUTRE" },
    ])
  })
})
