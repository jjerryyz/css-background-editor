/// <reference types="vite/client" />

declare module Base {
  interface DivBox {
    left: number
    top: number
    width: number
    height: number
    background: { image: string, x: number, y: number, w: number, h: number }[]
    selected: boolean
    isResizable: boolean
  }
}
