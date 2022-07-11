import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Searchbox } from './Searchbox'
import Rating from '../components/Rating'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getError } from '../utils'
import { toast } from 'react-toastify'
import { Store } from '../Store'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.playload }

    default:
      return state
  }
}
const prices = [
  { name: '£1 to £50', value: '1-50' },
  { name: '£51 to £200', value: '51-200' },
  { name: '£201 to £1000', value: '201-1000' },
]

export const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },
  {
    name: '3stars & up',
    rating: 3,
  },
  {
    name: '2stars & up',
    rating: 2,
  },
  {
    name: '1stars & up',
    rating: 1,
  },
]

export const FilterMenu = (props) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const category = sp.get('category') || 'all'
  const query = sp.get('query') || 'all'
  const price = sp.get('price') || 'all'
  const rating = sp.get('rating') || 'all'
  const order = sp.get('order') || 'newest'
  const page = sp.get('page') || 1

  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        )
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    fetchData()
  }, [category, error, order, page, price, query, rating])

  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`api/products/categories`)
        setCategories(data)
      } catch (err) {
        toast.error(getError(err))
      }
    }
    fetchCategories()
  }, [dispatch])

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page
    const filterCategory = filter.category || category
    const filterQuery = filter.query || query
    const filterRating = filter.rating || rating
    const filterPrice = filter.price || price
    const filterOrder = filter.order || order

    return `/search?page=${filterPage}&query=${filterQuery}&category=${filterCategory}&price=${filterPrice}&rating=${filterRating}&order=${filterOrder}`
  }
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { filerMenuIsOpen } = state
  const filterMenuHandler = () => {
    ctxDispatch({ type: 'FILTER_MENU', payload: !filerMenuIsOpen })
  }
  return (
    <div
      className={
        props.show ? `filter-menu div-bg ${props.show}` : 'filter-menu div-bg'
      }
    >
      <Searchbox />

      <div className='filter-options'>
        <div className='col-4'>
          <h3>Department</h3>
          <ul>
            <li>
              <Link
                className={'all' === category ? 'text-bold' : ''}
                to={getFilterUrl({ category: 'all' })}
                onClick={filterMenuHandler}
              >
                Any
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <Link
                  className={c === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: c, page: 1 })}
                  onClick={filterMenuHandler}
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='col-4'>
          <h3>Price</h3>
          <ul>
            <li>
              <Link
                className={'all' === price ? 'text-bold' : ''}
                to={getFilterUrl({ price: 'all' })}
                onClick={filterMenuHandler}
              >
                Any
              </Link>
            </li>
            {prices.map((p) => (
              <li key={p.value}>
                <Link
                  to={getFilterUrl({ price: p.value, page: 1 })}
                  className={p.value === price ? 'text-bold' : ''}
                  onClick={filterMenuHandler}
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='col-4'>
          <h3>Avr. Customer Review</h3>
          <ul>
            {ratings.map((r) => (
              <li key={r.name}>
                <Link
                  to={getFilterUrl({ rating: r.rating, page: 1 })}
                  className={
                    parseInt(r.rating) === parseInt(rating) ? 'text-bold' : ''
                  }
                  onClick={filterMenuHandler}
                >
                  <Rating caption={' & up'} rating={r.rating}></Rating>
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={getFilterUrl({ rating: 'all' })}
                className={rating === 'all' ? 'text-bold' : ''}
                onClick={filterMenuHandler}
              >
                <Rating caption={' & up'} rating={0}></Rating>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
