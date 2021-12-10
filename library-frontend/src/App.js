
import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useApolloClient } from '@apollo/client'
import Recommended from './components/Recommended'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  useEffect(() => {
    setToken(localStorage.getItem('books-user-token'))
  }, [])


  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}> login</button>
        </div>
  
        <Authors
          show={page === 'authors'}
        />
  
        <Books
          show={page === 'books'}
        />
  
        <Login
          show={page==='login'} setToken={setToken} setPage={setPage}
        />
  
      </div>
    )  
  } else {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => setPage('recommendations')}>recommendations</button>
          <button onClick={() => logout()}> logout</button>
        </div>
  
        <Authors
          show={page === 'authors'}
        />
  
        <Books
          show={page === 'books'}
        />
  
        <NewBook
          show={page === 'add'}
        />

        <Recommended
          show={page === 'recommendations'}
        />
      </div>
    )
  }
}

export default App