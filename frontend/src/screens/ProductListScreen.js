import axios from 'axios'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { Store } from '../Store'
import { getError } from '../utils'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
      }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true }
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false }
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false }
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false }
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false }
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false }
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        products: action.payload,
      }
    default:
      return state
  }
}

export const ProductListScreen = () => {
  const navigate = useNavigate()

  const [
    {
      loading,
      error,
      products,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  })

  const { search } = useLocation()
  const sp = new URLSearchParams(search)
  const page = sp.get('page') || 1

  const { state } = useContext(Store)
  const { userInfo } = state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/admin?page=${page}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        dispatch({ type: 'FETCH_SUCCESS', payload: data })
      } catch (err) {
        dispatch({ type: 'FETCH_FALIL', payload: getError(err) })
      }
    }

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' })
      navigate('/admin/products?page=1')
    } else {
      fetchData()
    }
  }, [page, userInfo, successDelete, navigate])

  const createHandler = async () => {
    if (window.confirm('Are you sure to creatr?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' })
        const { data } = await axios.post(
          '/api/products',
          {},
          { headers: { authorization: `Bearer ${userInfo.token}` } }
        )
        toast.success('product created successfully')
        dispatch({ type: 'CREATE_SUCCESS' })
        navigate(`/admin/product/${data.product._id}`)
      } catch (err) {
        toast.error(getError(err))
        dispatch({ type: 'CREATE_FAIL' })
      }
    }
  }

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' })
        await axios.delete(`/api/products/${product._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        })
        toast.success('product delete successfully')
        dispatch({ type: 'DELETE_SUCCESS' })
      } catch (err) {
        toast.error(getError(err))
        dispatch({ type: 'DELETE_FAIL' })
      }
    }
  }

  const [filteredItems, setFilteredItems] = useState([])
  const [searchTxt, setSearchTxt] = useState('')
  const searchHandler = (text) => {
    setSearchTxt(text)
    let tempItems = products
      .filter(
        (prod) => prod.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
      )
      .concat(
        products.filter(
          (prod) =>
            prod.category.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        products.filter(
          (prod) => prod._id.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        products.filter(
          (prod) => prod.brand.toLowerCase().indexOf(text.toLowerCase()) !== -1
        ),
        products.filter(
          (prod) => prod.price.toString().indexOf(text.toLowerCase()) !== -1
        )
      )
      .reduce((accumulator, current) => {
        if (!accumulator.find(({ _id }) => _id === current._id)) {
          accumulator.push(current)
        }
        return accumulator
      }, [])
    setFilteredItems(tempItems)
  }

  return (
    <div>
      <Helmet>
        <title>Admin -products</title>
      </Helmet>

      <h1 className='title'>Products</h1>

      <div className='product-search-row div-bg'>
        <label className='label'>
          <input
            required
            type='text'
            placeholder='e.g. spider'
            onChange={(e) => searchHandler(e.target.value)}
          />
          <span>Search</span>
          <span className='box-underline'></span>
          <i className='search-icon fas fa-search'></i>
        </label>
        <button className='product-creat-btn' onClick={createHandler}>
          Create Product
        </button>
      </div>
      {loadingCreate && <LoadingBox />}
      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <div className='table-wrap'>
          <table className='table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {searchTxt &&
                filteredItems.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id}</td>
                    <td>
                      <Link to={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </td>
                    <td>{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      <button
                        type='button'
                        variant='light'
                        onClick={() =>
                          navigate(`/admin/product/${product._id}`)
                        }
                      >
                        Edit
                      </button>
                      &nbsp;
                      <button
                        type='button'
                        variant='light'
                        onClick={() => deleteHandler(product)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {!searchTxt &&
                products &&
                products.map((product) => (
                  <tr key={product._id}>
                    <td>{product._id}</td>
                    <td>
                      <Link to={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </td>
                    <td>{product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>
                      <button
                        type='button'
                        variant='light'
                        onClick={() =>
                          navigate(`/admin/product/${product._id}`)
                        }
                      >
                        Edit
                      </button>
                      &nbsp;
                      <button
                        type='button'
                        variant='light'
                        onClick={() => deleteHandler(product)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div style={{ display: 'none' }}>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
