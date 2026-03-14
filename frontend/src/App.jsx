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
  const [inputValue, setInputValue] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
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

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

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
          setAuthError('Registered! Please log in.')
        }
      } else {
        setAuthError(data.detail || 'Authentication failed')
      }
    } catch (err) {
      setAuthError('Network error')
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
      const params = new URLSearchParams()
      params.append('limit', limit)
      params.append('offset', offset)
      if (search) params.append('q', search)
      if (filter === 'active') params.append('is_done', 'false')
      if (filter === 'done') params.append('is_done', 'true')
      params.append('sort', sort)

      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: getHeaders()
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      const data = await res.json()
      setTodos(data.items || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAdd = async () => {
    if (!inputValue.trim()) return
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: inputValue.trim() })
      })
      if (res.status === 401) return handleLogout()
      if (res.ok) {
        setInputValue('')
        setOffset(0)
        setSort('-created_at')
        fetchTodos()
      } else {
        const err = await res.json()
        alert('Failed: ' + JSON.stringify(err.detail))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleToggle = async (todo) => {
    try {
      const res = await fetch(`${API_URL}/${todo.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_done: !todo.is_done })
      })
      if (res.status === 401) return handleLogout()
      if (res.ok) fetchTodos()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      if (res.status === 401) return handleLogout()
      if (res.ok) {
        if (offset > 0 && offset + 1 === total) {
          setOffset(prev => prev - limit)
        } else {
          fetchTodos()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit) || 1

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
        <h1>{isLoginView ? 'Login' : 'Register'}</h1>
        {authError && <p style={{ color: 'red' }}>{authError}</p>}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ padding: '10px' }}>
            {isLoginView ? 'Login' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '10px', cursor: 'pointer', color: 'blue' }} onClick={() => setIsLoginView(!isLoginView)}>
          {isLoginView ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My ToDo List</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="controls-container">
        <input
          type="text"
          placeholder="Search todos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="done">Done</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="-created_at">Newest First</option>
          <option value="created_at">Oldest First</option>
        </select>
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="What needs to be done? (min 3 chars)"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAdd()}
        />
        <button id="add-btn" onClick={handleAdd}>Add</button>
      </div>

      <ul id="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.is_done ? 'done' : ''}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <input
                type="checkbox"
                checked={todo.is_done}
                onChange={() => handleToggle(todo)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              <span className="todo-text" onClick={() => handleToggle(todo)}>
                {todo.title}
              </span>
            </div>
            <button className="delete-btn" onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div className="pagination-container">
        <button disabled={offset === 0} onClick={() => setOffset(prev => prev - limit)}>Prev</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={offset + limit >= total} onClick={() => setOffset(prev => prev + limit)}>Next</button>
      </div>
    </div>
  )
}

export default App
