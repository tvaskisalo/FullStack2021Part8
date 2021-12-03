  
import React, { useState } from 'react'

import {useMutation, useQuery} from '@apollo/client'

import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'


const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  const [setBornTo, setYear] = useState(0)
  const [name, setName] = useState('')
  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ {query: ALL_AUTHORS}]
  })
  if (!props.show || result.loading) {
    return null
  }
  const authors = result.data.allAuthors

  const handleChange = (event) => {
    event.preventDefault()
    console.log(name);
    setName(event.target.value)
  }
  const handleSubmit = (event) => {
    event.preventDefault()
    editAuthor( {variables: {name, setBornTo}})
    setName('')
    setYear(0)
  }


  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h2>Update birthyear</h2>
      <form onSubmit={handleSubmit}> 
        <select value={name} onChange={handleChange}>
          {authors.map(a => <option key = {a.name} value={a.name}>{a.name}</option>)}
        </select>
        <input
          value={setBornTo}
          onChange={({ target }) => setYear(Number(target.value))}
        />
        <button type='submit'>submit</button>
      </form>
    </div>
  )
}

export default Authors
