import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store } from '../Store'

export const Searchbox = () => {
  const { dispatch: ctxDispatch } = useContext(Store)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const submitHandler = (e) => {
    e.preventDefault()
    navigate(query ? `search/?query=${query}` : '/search')
    ctxDispatch({ type: 'FILTER_MENU', payload: false })
  }
  return (
    <form className='search-component' onSubmit={submitHandler}>
      <label className='label'>
        <input
          type='text'
          placeholder='e.g. spider'
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className='label-name'>Search</span>
        <span className='box-underline'></span>
        <button className='search-btn' type='submit'>
          <i className='fas fa-search'></i>
        </button>
      </label>
    </form>
  )
}
