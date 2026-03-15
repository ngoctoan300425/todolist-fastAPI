import { useState, useEffect } from 'react'
import './App.css'

const API_URL = '/api/v1/todos'
const AUTH_URL = '/api/v1/auth'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [todos, setTodos] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    tags: ''
  })
  const [editingTodo, setEditingTodo] = useState(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, active, done, today, overdue
  const [sort, setSort] = useState('-created_at')

  const [limit] = useState(5)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (token) fetchTodos()
  }, [offset, filter, sort, search, token])

  useEffect(() => {
    setOffset(0)
  }, [search, filter, sort])

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  })

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    const endpoint = isLoginView ? '/login' : '/register'
    try {
      const res = await fetch(`${AUTH_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        if (isLoginView) {
          setToken(data.access_token)
          localStorage.setItem('token', data.access_token)
          setEmail('')
          setPassword('')
        } else {
          setIsLoginView(true)
          setAuthError('Registered successfully! Please login.')
        }
      } else {
        setAuthError(data.detail || 'Authentication failed')
      }
    } catch (err) {
      setAuthError('Connection error')
    }
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
    setTodos([])
    setOffset(0)
  }

  const fetchTodos = async () => {
    try {
      let url = API_URL
      const params = new URLSearchParams()

      if (filter === 'today') {
        url = `${API_URL}/today`
      } else if (filter === 'overdue') {
        url = `${API_URL}/overdue`
      } else {
        params.append('limit', limit)
        params.append('offset', offset)
        if (search) params.append('q', search)
        if (filter === 'active') params.append('is_done', 'false')
        if (filter === 'done') params.append('is_done', 'true')
        params.append('sort', sort)
      }

      const queryString = params.toString()
      const res = await fetch(`${url}${queryString ? '?' + queryString : ''}`, {
        headers: getHeaders()
      })

      if (res.status === 401) return handleLogout()

      const data = await res.json()
      if (filter === 'today' || filter === 'overdue') {
        setTodos(data || [])
        setTotal(data?.length || 0)
      } else {
        setTodos(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.title.length < 3) return alert('Title must be at least 3 characters')

    const body = {
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
    }

    try {
      const method = editingTodo ? 'PUT' : 'POST'
      const url = editingTodo ? `${API_URL}/${editingTodo.id}` : API_URL

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body)
      })

      if (res.status === 401) return handleLogout()

      if (res.ok) {
        setFormData({ title: '', description: '', due_date: '', tags: '' })
        setEditingTodo(null)
        fetchTodos()
      } else {
        const err = await res.json()
        alert('Error: ' + JSON.stringify(err.detail))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggleDone = async (todo) => {
    try {
      // For level 6, let's use the specific /complete endpoint if we are checking it
      const url = !todo.is_done ? `${API_URL}/${todo.id}/complete` : `${API_URL}/${todo.id}`
      const method = !todo.is_done ? 'POST' : 'PATCH'
      const body = !todo.is_done ? null : JSON.stringify({ is_done: false })

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body
      })
      if (res.status === 401) return handleLogout()
      if (res.ok) fetchTodos()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditClick = (todo) => {
    setEditingTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description || '',
      due_date: todo.due_date ? new Date(todo.due_date).toISOString().slice(0, 16) : '',
      tags: todo.tags?.map(t => t.name).join(', ') || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (res.status === 401) return handleLogout()
      if (res.ok) fetchTodos()
    } catch (error) {
      console.error(error)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const isOverdue = (dateStr) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  if (!token) {
    return (
      <div className="container auth-card">
        <h1>{isLoginView ? 'Login' : 'Register'}</h1>
        {authError && <p style={{ color: 'red', textAlign: 'center' }}>{authError}</p>}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="primary">
            {isLoginView ? 'Login' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}
          onClick={() => setIsLoginView(!isLoginView)}>
          {isLoginView ? "Need an account? Register" : "Have an account? Login"}
        </p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Task Master <span className="badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>Cấp 6</span></h1>
        <button onClick={handleLogout} className="secondary">Logout</button>
      </div>

      <div className="input-card">
        <h3>{editingTodo ? 'Edit Task' : 'Add New Task'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="2"
              placeholder="Add more details..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="datetime-local"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="work, personal, urgent"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="primary" style={{ flex: 1 }}>
              {editingTodo ? 'Save Changes' : 'Add Task'}
            </button>
            {editingTodo && (
              <button type="button" className="secondary" onClick={() => {
                setEditingTodo(null)
                setFormData({ title: '', description: '', due_date: '', tags: '' })
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="controls-container">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="done">Done</option>
          <option value="today">Today</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-created_at">Newest First</option>
          <option value="created_at">Oldest First</option>
          <option value="due_date">Due Date Asc</option>
          <option value="-due_date">Due Date Desc</option>
        </select>
      </div>

      <ul className="todo-list">
        {todos.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tasks found.</p>}
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.is_done ? 'done' : ''}`}>
            <div className="todo-header">
              <input
                type="checkbox"
                checked={todo.is_done}
                onChange={() => handleToggleDone(todo)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '4px' }}
              />
              <div className="todo-content">
                <span className="todo-title">{todo.title}</span>
                {todo.description && <p className="todo-desc">{todo.description}</p>}

                <div className="todo-meta">
                  {todo.due_date && (
                    <span className={`due-date ${isOverdue(todo.due_date) && !todo.is_done ? 'overdue' : ''}`}>
                      📅 {formatDate(todo.due_date)}
                    </span>
                  )}
                  {todo.tags?.map(tag => (
                    <span key={tag.id} className="tag">#{tag.name}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="todo-actions">
              <button className="secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleEditClick(todo)}>Edit</button>
              <button className="danger" onClick={() => handleDelete(todo.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {filter !== 'today' && filter !== 'overdue' && (
        <div className="pagination">
          <button className="secondary" disabled={offset === 0} onClick={() => setOffset(prev => Math.max(0, prev - limit))}>Prev</button>
          <span style={{ fontWeight: '600' }}>{Math.floor(offset / limit) + 1} / {Math.ceil(total / limit) || 1}</span>
          <button className="secondary" disabled={offset + limit >= total} onClick={() => setOffset(prev => prev + limit)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default App
