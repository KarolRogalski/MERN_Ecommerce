import React, { useState } from 'react'
import button from 'react-bootstrap/button'
import Form from 'react-bootstrap/Form'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import { useNavigate } from 'react-router-dom'

export const Searchbox = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const submitHandler = (e) => {
    e.preventDefault()
    navigate(query ? `search/?query=${query}` : '/search')
  }
  return (
    <form className='search-component' onSubmit={submitHandler}>
      <label className='label'>
        <input
          type='text'
          placeholder='e.g. spider'
          onChange={(e) => setQuery(e.target.value)}
        />
        <span>Search</span>
        <span className='box-underline'></span>
        <button className='search-btn' type='submit'>
          <i className='fas fa-search'></i>
        </button>
      </label>
    </form>
  )
}
