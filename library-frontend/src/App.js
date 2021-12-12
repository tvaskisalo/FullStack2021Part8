
import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useApolloClient, useSubscription } from '@apollo/client'
import Recommended from './components/Recommended'
import {ALL_BOOKS, BOOK_ADDED} from './queries'

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

  const updateCacheWith = (bookAdded) => {
    const includedIn = (set, object) => 
      set.map(b => b.id).includes(object.id)
    const  bookInStore = client.readQuery({ query: ALL_BOOKS})
    if (!includedIn(bookInStore.allBooks, bookAdded)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: {allBooks: bookInStore.allBooks.concat(bookAdded)}
      })
    }
    
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const bookAdded = subscriptionData.data.bookAdded
      window.alert(`new book ${bookAdded.title} was added`)
      updateCacheWith(bookAdded)
    }
  })
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