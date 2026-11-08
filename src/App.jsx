import { useCallback, useEffect, useMemo, useReducer } from 'react'

import { createUser, deleteUser, getUsers, updateUser } from './api'
import { LOAD_MORE_DELAY } from './config'
import { initialState, reducer } from './reducer'

import CardList from './components/CardList/CardList'
import ErrorScreen from './components/ErrorScreen/ErrorScreen'
import Form from './components/Form/Form'
import Loading from './components/Loading/Loading'
import ToolBar from './components/ToolBar/ToolBar'


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const SORTERS = {
  default: null,
  id_asc: (a, b) => Number(a.id) - Number(b.id),
  id_desc: (a, b) => Number(b.id) - Number(a.id),
  name_asc: (a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'vi'),
  name_desc: (a, b) => String(b.name ?? '').localeCompare(String(a.name ?? ''), 'vi'),
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { users, status, busy, notice, form, editingId, deleteMode, selectedIds, query, sort } =
    state

  // ---------- Read ----------
  const loadUsers = useCallback(async () => {
    try {
      dispatch({ type: 'load_success', users: await getUsers() })
    } catch (error) {
      console.error(error)
      dispatch({ type: 'load_failure' })
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const retry = () => {
    dispatch({ type: 'load_start' })
    loadUsers()
  }

  // ---------- Search + sort (client side), then paginate ----------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? users.filter((u) =>
          [u.name, u.email, u.address, u.phone].some((v) => String(v ?? '').toLowerCase().includes(q))
        )
      : users
    const sorter = SORTERS[sort]
    if (sorter) list = [...list].sort(sorter)
    return list
  }, [users, query, sort])

  // Memoised so CardList gets the same array reference while typing in the form
  const visibleUsers = useMemo(
    () => filtered.slice(0, state.visibleCount),
    [filtered, state.visibleCount]
  )
  const hasMore = state.visibleCount < filtered.length

  // ---------- Infinite scroll: wait ~1s before showing the next page ----------
  const loadMore = useCallback(() => dispatch({ type: 'load_more_start' }), [])

  // Stable callbacks (needed for React.memo on ToolBar / CardList / Card to work)
  const handleQuery = useCallback((value) => dispatch({ type: 'set_query', value }), [])
  const handleSort = useCallback((value) => dispatch({ type: 'set_sort', value }), [])
  const handleToggleSelected = useCallback((id) => dispatch({ type: 'toggle_selected', id }), [])
  const handleEdit = useCallback((user) => {
    dispatch({ type: 'start_edit', user })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!state.loadingMore) return
    const timer = setTimeout(() => dispatch({ type: 'load_more_done' }), LOAD_MORE_DELAY)
    return () => clearTimeout(timer)
  }, [state.loadingMore])

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
        total={filtered.length}
        shown={visibleUsers.length}
        onQuery={handleQuery}
        onSort={handleSort}
      />

      <CardList
        users={visibleUsers}
        deleteMode={deleteMode}
        selectedIds={selectedIds}
        hasMore={hasMore}
        loadingMore={state.loadingMore}
        onLoadMore={loadMore}
        onToggleSelected={handleToggleSelected}
        onEdit={handleEdit}
      />
    </>
  )
}

export default App
