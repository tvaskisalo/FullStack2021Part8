
import React, { useEffect, useState} from 'react'

import {useLazyQuery} from '@apollo/client'
import { ALL_BOOKS } from '../queries'


const Books = (props) => {
  const [showBooks, setShowBooks] = useState(null)
  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [booksQuery] = useLazyQuery(ALL_BOOKS)
  

  const handleFilter = ({filter})=> {
    let copy = []
    if (filter === '') {
      setShowBooks(books)
    } else {
      books.forEach(book => {
        if (book.genres.includes(filter)) {
          copy = copy.concat(book)
        }
      })
      setShowBooks(copy)
    }
  }

  useEffect(() => {
    booksQuery().then(res => {
      setBooks(res.data.allBooks)
      setShowBooks(res.data.allBooks)
      let copy = []
      res.data.allBooks.forEach(book => {
      book.genres.forEach(genre => {
        if (!copy.includes(genre)) {
          copy = copy.concat(genre)
        }
      })
      })
      setGenres(copy)
    })
  },[])
  if (!props.show) {
    return null
  }
  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {showBooks.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      {genres.map(g => 
        <button key={g} onClick={() => handleFilter({filter:g})}>{g}</button>
      )}
      <button onClick={() => handleFilter({filter:''})}>Show All</button>
    </div>
  )
}

export default Books