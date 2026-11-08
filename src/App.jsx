import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { createUser, deleteUser, getUsers, updateUser } from './api'
import { SEARCH_DELAY } from './config'
import { initialState, reducer } from './reducer'

import CardList from './components/CardList/CardList'
import ErrorScreen from './components/ErrorScreen/ErrorScreen'
import Form from './components/Form/Form'
import Loading from './components/Loading/Loading'
import ToolBar from './components/ToolBar/ToolBar'


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SORT_PARAMS = {
  default: {},
  id_asc: { sortBy: 'id', order: 'asc' },
  id_desc: { sortBy: 'id', order: 'desc' },
  name_asc: { sortBy: 'name', order: 'asc' },
  name_desc: { sortBy: 'name', order: 'desc' },
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    users, status, busy, notice, form, editingId, deleteMode, selectedIds,
    query, sort, page, hasMore, loadingMore,
  } = state

  // ---------- Search + sort run on the server ----------
  // Debounce typing so we don't call the API on every keystroke
  const [search, setSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY)
    return () => clearTimeout(timer)
  }, [query])

  // Bumped on every page-1 request so late responses from an older
  // search/sort can't overwrite the current results
  const seqRef = useRef(0)
  const [retryTick, setRetryTick] = useState(0)

  useEffect(() => {
    const seq = ++seqRef.current
    dispatch({ type: 'reload_start' })
    getUsers({ page: 1, search, ...SORT_PARAMS[sort] })
      .then((batch) => {
        if (seq === seqRef.current) dispatch({ type: 'load_success', users: batch })
      })
      .catch((error) => {
        console.error(error)
        if (seq === seqRef.current) dispatch({ type: 'load_failure' })
      })
  }, [search, sort, retryTick])

  const retry = () => {
    dispatch({ type: 'load_start' })
    setRetryTick((n) => n + 1)
  }

  // ---------- Infinite scroll: fetch the next page from the server ----------
  const loadMore = useCallback(() => dispatch({ type: 'load_more_start' }), [])

  useEffect(() => {
    if (!loadingMore) return
    const seq = seqRef.current
    getUsers({ page: page + 1, search, ...SORT_PARAMS[sort] })
      .then((batch) => {
        if (seq === seqRef.current) dispatch({ type: 'load_more_success', batch })
      })
      .catch((error) => {
        console.error(error)
        if (seq === seqRef.current) dispatch({ type: 'load_more_failure' })
      })
  }, [loadingMore, page, search, sort])

  // Stable callbacks (needed for React.memo on ToolBar / CardList / Card to work)
  const handleQuery = useCallback((value) => dispatch({ type: 'set_query', value }), [])
  const handleSort = useCallback((value) => dispatch({ type: 'set_sort', value }), [])
  const handleToggleSelected = useCallback((id) => dispatch({ type: 'toggle_selected', id }), [])
  const handleEdit = useCallback((user) => {
    dispatch({ type: 'start_edit', user })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ---------- Create / Update ----------
  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      return dispatch({ type: 'notice', notice: { type: 'error', text: 'Vui lòng nhập tên.' } })
    }
    if (form.email && !EMAIL_RE.test(form.email)) {
      return dispatch({ type: 'notice', notice: { type: 'error', text: 'Email không hợp lệ.' } })
    }

    dispatch({ type: 'busy', value: true })
    dispatch({ type: 'notice', notice: null })
    try {
      if (editingId) {
        const user = await updateUser(editingId, form)
        dispatch({ type: 'user_updated', user })
        dispatch({ type: 'notice', notice: { type: 'success', text: 'Đã cập nhật user.' } })
      } else {
        const user = await createUser(form)
        dispatch({ type: 'user_added', user })
        dispatch({ type: 'notice', notice: { type: 'success', text: 'Đã thêm user.' } })
      }
    } catch (error) {
      console.error(error)
      dispatch({
        type: 'notice',
        notice: { type: 'error', text: 'Không thể lưu user. Vui lòng thử lại.' },
      })
    } finally {
      dispatch({ type: 'busy', value: false })
    }
  }

  // ---------- Delete ----------
  async function handleDeleteSelected() {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Xóa ${selectedIds.length} tài khoản?`)) return

    dispatch({ type: 'busy', value: true })
    dispatch({ type: 'notice', notice: null })

    const results = await Promise.allSettled(selectedIds.map((id) => deleteUser(id)))
    const deleted = selectedIds.filter((_, i) => results[i].status === 'fulfilled')
    const failed = selectedIds.length - deleted.length

    if (deleted.length) dispatch({ type: 'users_removed', ids: deleted })
    dispatch({
      type: 'notice',
      notice: failed
        ? { type: 'error', text: `Đã xóa ${deleted.length}, ${failed} tài khoản xóa thất bại.` }
        : { type: 'success', text: `Đã xóa ${deleted.length} tài khoản.` },
    })
    if (!failed) dispatch({ type: 'toggle_delete_mode' })
    dispatch({ type: 'busy', value: false })
  }

  if (status === 'loading') return <Loading />
  if (status === 'error') return <ErrorScreen onRetry={retry} />

  return (
    <>
      <Form
        form={form}
        editing={editingId !== null}
        deleteMode={deleteMode}
        busy={busy}
        notice={notice}
        selectedCount={selectedIds.length}
        onChange={(field, value) => dispatch({ type: 'set_field', field, value })}
        onSubmit={handleSubmit}
        onCancelEdit={() => dispatch({ type: 'cancel_edit' })}
        onToggleDelete={() => dispatch({ type: 'toggle_delete_mode' })}
        onDeleteSelected={handleDeleteSelected}
      />

      <ToolBar
        query={query}
        sort={sort}
        shown={users.length}
        hasMore={hasMore}
        onQuery={handleQuery}
        onSort={handleSort}
      />

      <CardList
        users={users}
        deleteMode={deleteMode}
        selectedIds={selectedIds}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
        onToggleSelected={handleToggleSelected}
        onEdit={handleEdit}
      />
    </>
  )
}

export default App
