import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = 'http://localhost:5006/api'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  })
  const [editingId, setEditingId] = useState(null)

  // Carregar utilizador
  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/users`)
      setUsers(response.data.data)
      setError('')
    } catch (err) {
      setError('Erro ao carregar utilizador: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Manipular mudanças no formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        // Atualizar utilizador
        await axios.put(`${API_BASE}/users/${editingId}`, formData)
        setSuccess('Utilizador atualizado com sucesso!')
      } else {
        // Criar utilizador
        await axios.post(`${API_BASE}/users`, formData)
        setSuccess('Utilizador criado com sucesso!')
      }
      
      resetForm()
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar utilizador')
    }
  }

  // Editar utilizador
  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    })
    setEditingId(user.id)
  }

  // Excluir utilizador
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este utilizador?')) return

    try {
      await axios.delete(`${API_BASE}/users/${id}`)
      setSuccess('Utilizador excluído com sucesso!')
      loadUsers()
    } catch (err) {
      setError('Erro ao excluir utilizador: ' + (err.response?.data?.error || err.message))
    }
  }

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user'
    })
    setEditingId(null)
  }

  // Estatísticas
  const stats = {
    total: users.length,
    admins: users.filter(user => user.role === 'admin').length,
    users: users.filter(user => user.role === 'user').length
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 DevOps Demo</h1>
        <p>Gerenciamento de Utilizador - Full Stack Application</p>
      </div>

      {/* Estatísticas */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total de Utilizador</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.admins}</span>
          <span className="stat-label">Administradores</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.users}</span>
          <span className="stat-label">Utilizador Comun</span>
        </div>
      </div>

      {/* Alertas */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Formulário */}
      <div className="card">
        <h2>{editingId ? 'Editar Utilizador' : 'Adicionar Novo Utilizador'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Função:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="user">Utilizador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Atualizar' : 'Adicionar'} Utilizador
            </button>
            {editingId && (
              <button type="button" className="btn" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de Utilizador */}
      <div className="card">
        <h2>Lista de Utilizador</h2>
        
        {loading ? (
          <div className="loading">Carregando utilizador...</div>
        ) : (
          <div className="users-grid">
            {users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                  <span className="user-role">{user.role}</span>
                </div>
                <div className="user-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleEdit(user)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Nenhum utilizador cadastrado
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App