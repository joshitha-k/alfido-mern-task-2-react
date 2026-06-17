import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'

// ============================================
// IMPORTANT: Change this to match your Task 1 API
// ============================================
const API_URL = 'http://localhost:5000/api/products'

// ============================================
// HOME PAGE - List all products
// ============================================
function Home() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(API_URL)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setItems(result.data || result)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete?')) return
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete')
      }
      
      fetchItems()
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
  }

  if (loading) return <div style={{padding: 20}}>Loading...</div>
  
  if (error) return (
    <div style={{padding: 20, color: 'red'}}>
      <h3>Error: {error}</h3>
      <p>Make sure Task 1 API is running on port 5000</p>
      <button onClick={fetchItems} style={{cursor: 'pointer'}}>Retry</button>
    </div>
  )

  return (
    <div style={{padding: 20}}>
      <h1>📋 Products List</h1>
      <Link to="/add">
        <button style={{marginBottom: 20, padding: '10px 20px', cursor: 'pointer'}}>
          + Add New Product
        </button>
      </Link>
      
      {items.length === 0 ? (
        <p>No products found. Add one!</p>
      ) : (
        <table border="1" cellPadding="10" style={{borderCollapse: 'collapse', width: '100%'}}>
          <thead>
            <tr style={{background: '#f0f0f0'}}>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>${item.price}</td>
                <td>{item.category}</td>
                <td>
                  <Link to={`/edit/${item._id}`}>
                    <button style={{marginRight: 10, cursor: 'pointer'}}>Edit</button>
                  </Link>
                  <button 
                    onClick={() => deleteItem(item._id)} 
                    style={{background: '#ff4444', color: 'white', cursor: 'pointer'}}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ============================================
// ADD PAGE - Create new product
// ============================================
function AddItem() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '', 
    inStock: true 
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to create')
      }
      
      navigate('/')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{padding: 20, maxWidth: 500}}>
      <h1>➕ Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: 15}}>
          <label>Name:</label><br/>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>Description:</label><br/>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            style={{width: '100%', padding: 8, height: 100}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>Price:</label><br/>
          <input 
            type="number" 
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>Category:</label><br/>
          <input 
            type="text" 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>
            <input 
              type="checkbox" 
              checked={formData.inStock}
              onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
            />
            In Stock
          </label>
        </div>
        <button type="submit" disabled={saving} style={{cursor: 'pointer'}}>
          {saving ? 'Saving...' : 'Save Product'}
        </button>
        <Link to="/" style={{marginLeft: 10}}>
          <button type="button" style={{cursor: 'pointer'}}>Cancel</button>
        </Link>
      </form>
    </div>
  )
}

// ============================================
// EDIT PAGE - Update existing product
// ============================================
function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '', 
    inStock: true 
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch')
      }
      
      const result = await response.json()
      const data = result.data || result
      
      setFormData({ 
        name: data.name || '', 
        description: data.description || '', 
        price: data.price || '',
        category: data.category || '',
        inStock: data.inStock !== false
      })
    } catch (err) {
      alert('Error loading item: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to update')
      }
      
      navigate('/')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{padding: 20}}>Loading...</div>

  return (
    <div style={{padding: 20, maxWidth: 500}}>
      <h1>✏️ Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: 15}}>
          <label>Name:</label><br/>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>Description:</label><br/>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            style={{width: '100%', padding: 8, height: 100}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>Price:</label><br/>
          <input 
            type="number" 
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>Category:</label><br/>
          <input 
            type="text" 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 15}}>
          <label>
            <input 
              type="checkbox" 
              checked={formData.inStock}
              onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
            />
            In Stock
          </label>
        </div>
        <button type="submit" disabled={saving} style={{cursor: 'pointer'}}>
          {saving ? 'Saving...' : 'Update Product'}
        </button>
        <Link to="/" style={{marginLeft: 10}}>
          <button type="button" style={{cursor: 'pointer'}}>Cancel</button>
        </Link>
      </form>
    </div>
  )
}

// ============================================
// MAIN APP - Route Configuration
// ============================================
function App() {
  return (
    <div>
      <nav style={{padding: 15, background: '#333', color: 'white'}}>
        <Link to="/" style={{color: 'white', textDecoration: 'none', fontSize: 18}}>
          🏠 My React App
        </Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/edit/:id" element={<EditItem />} />
      </Routes>
    </div>
  )
}

export default App