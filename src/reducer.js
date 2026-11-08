import { PAGE_SIZE } from './config'

export const emptyForm = {
  name: '',
  email: '',
  address: '',
  street: '',
  phone: '',
  zipcode: '',
  password: '',
  music: '',
  avatar: '',
  genre: 'male',
}

export const initialState = {
  users: [],
  status: 'loading', // loading | ready | error (initial load only)
  busy: false, // a create / update / delete request is running
  notice: null, // { type: 'error' | 'success', text }

  form: emptyForm,
  editingId: null,

  deleteMode: false,
  selectedIds: [],

  query: '',
  sort: 'default',

  visibleCount: PAGE_SIZE,
  loadingMore: false,
}

export function reducer(state, action) {
  switch (action.type) {
    case 'load_start':
      return { ...state, status: 'loading', notice: null }
    case 'load_success':
      return { ...state, status: 'ready', users: action.users }
    case 'load_failure':
      return { ...state, status: 'error' }

    case 'busy':
      return { ...state, busy: action.value }
    case 'notice':
      return { ...state, notice: action.notice }

    case 'set_field':
      return { ...state, form: { ...state.form, [action.field]: action.value } }

    case 'start_edit': {
      const { id, ...rest } = action.user
      const form = { ...emptyForm }
      for (const key of Object.keys(emptyForm)) form[key] = rest[key] ?? emptyForm[key]
      return { ...state, form, editingId: id, deleteMode: false, selectedIds: [], notice: null }
    }
    case 'cancel_edit':
      return { ...state, form: emptyForm, editingId: null, notice: null }

    case 'user_added':
      return { ...state, users: [...state.users, action.user], form: emptyForm }
    case 'user_updated':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.user.id ? action.user : u)),
        form: emptyForm,
        editingId: null,
      }
    case 'users_removed':
      return {
        ...state,
        users: state.users.filter((u) => !action.ids.includes(u.id)),
        selectedIds: state.selectedIds.filter((id) => !action.ids.includes(id)),
      }

    case 'toggle_delete_mode':
      return {
        ...state,
        deleteMode: !state.deleteMode,
        selectedIds: [],
        notice: null,
        form: emptyForm,
        editingId: null,
      }
    case 'toggle_selected':
      return {
        ...state,
        selectedIds: state.selectedIds.includes(action.id)
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      }

    case 'set_query':
      return { ...state, query: action.value, visibleCount: PAGE_SIZE, loadingMore: false }
    case 'set_sort':
      return { ...state, sort: action.value, visibleCount: PAGE_SIZE, loadingMore: false }

    case 'load_more_start':
      return state.loadingMore ? state : { ...state, loadingMore: true }
    case 'load_more_done':
      return { ...state, loadingMore: false, visibleCount: state.visibleCount + PAGE_SIZE }

    default:
      return state
  }
}
