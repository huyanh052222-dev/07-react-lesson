export const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://671891927fc4c5ff8f49fcac.mockapi.io/v2'

// Server-side pagination
export const PAGE_SIZE = 15
export const SEARCH_DELAY = 300 // ms debounce before calling the API

// Virtual scroll (fixed row height)
export const ITEM_HEIGHT = 60 // px, height of one card (keep in sync with Card.css)
export const ITEM_GAP = 10 // px, space between cards
export const OVERSCAN = 5 // extra rows rendered above/below the viewport
