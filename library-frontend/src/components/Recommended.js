import React, { useEffect, useState } from 'react'

import {useQuery, useLazyQuery} from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'


const Recommended= (props) => {
  const [genre, setGenre] = useState('')
  const [books, setBooks] = useState([])
  const meResult = useQuery(ME)
  const [getBooks] = useLazyQuery(ALL_BOOKS)
  useEffect(() => {
    (async () => {
        if (genre !== '') {
            const result = await getBooks({variables:{genre: genre}})
            setBooks(result.data.allBooks)
        }
    })()
  }, [genre])

  useEffect(() => {
    if (!meResult.loading){
        setGenre(meResult.data.me.favoriteGenre.toLowerCase())
    }
  },[meResult])

  if (!props.show || meResult.loading) {
    return null
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <div>Books in your favourite genre <b>{genre}</b></div>
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
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended