import axios from 'axios'
import React, { useReducer, useState } from 'react'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getError } from '../utils'
import Rating from '../components/Rating'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import Product from '../components/Product'
import { Searchbox } from '../components/Searchbox'

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

export const SearchScreen = () => {
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
  const [showFilter, setShowFilter] = useState(false)
  const filterToggle = () => {
    setShowFilter(!showFilter)
  }
  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>

      <div className='search-row'>
        <div
          className={
            showFilter ? 'search-filter' : 'search-filter search-filter-hidden'
          }
        >
          <div className='search-row-toggle' onClick={filterToggle}>
            <h2>Filter</h2>
            <button
              className={
                showFilter
                  ? 'search-filter-btn-toggle'
                  : 'search-filter-btn-toggle rotate-180'
              }
            ></button>
          </div>
          <div className='search'>
            <Searchbox />
          </div>
          <div>
            <h3>Department</h3>
            <ul>
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Any
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: c, page: 1 })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Price</h3>
            <ul>
              <li>
                <Link
                  className={'all' === price ? 'text-bold' : ''}
                  to={getFilterUrl({ price: 'all' })}
                >
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value, page: 1 })}
                    className={p.value === price ? 'text-bold' : ''}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Avr. Customer Review</h3>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating, page: 1 })}
                    className={
                      parseInt(r.rating) === parseInt(rating) ? 'text-bold' : ''
                    }
                  >
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={rating === 'all' ? 'text-bold' : ''}
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='search-resoult'>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant='danger'>{error}</MessageBox>
          ) : (
            <>
              <div className='search-result-row'>
                <span className='search-span'>
                  {countProducts === 0 ? 'No' : countProducts} Results
                  {query !== 'all' && ' : ' + query}
                  {category !== 'all' && ' : ' + category}
                  {price !== 'all' && ' : Price ' + price}
                  {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                  {query !== 'all' ||
                  category !== 'all' ||
                  rating !== 'all' ||
                  price !== 'all' ? (
                    <button
                      className='filter-btn-delete'
                      onClick={() => navigate('/search')}
                    >
                      <i className='fas fa-times-circle'></i>
                    </button>
                  ) : null}
                </span>
                <span className='search-span'>
                  Sort by{': '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value, page: 1 }))
                    }}
                  >
                    <option value='newest'>Newest Arrivals</option>
                    <option value='lowest'>Price: Low to Height</option>
                    <option value='highest'>Price: Height to Low</option>
                    <option value='toprated'>Avg. Customer Reviews</option>
                  </select>
                </span>
              </div>
              {products.lenght === 0 && (
                <MessageBox>No Products Found</MessageBox>
              )}
              <div className='search-row'>
                {products.map((product) => (
                  <Product key={product._id} product={product}></Product>
                ))}
              </div>
              <div>
                {[...Array(pages).keys()].map((x) => (
                  // <span
                  //   key={x + 1}
                  //   className='mx-1'
                  //   to={getFilterUrl({ page: x + 1 })}
                  // >
                  <button
                    key={x + 1}
                    className={Number(page) === x + 1 ? 'active mx-1' : 'mx-1'}
                    onClick={() => navigate(getFilterUrl({ page: x + 1 }))}
                  >
                    {x + 1}
                  </button>
                  // </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
