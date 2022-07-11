import axios from 'axios'
import React, { useContext, useEffect, useReducer, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Store } from '../Store'
import { getError } from '../utils'
import { Helmet } from 'react-helmet-async'
import LoadingBox from '../components/LoadingBox'
import MessageBox from '../components/MessageBox'
import { toast } from 'react-toastify'

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true }
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false }
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false }
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' }
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' }
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload }

    default:
      return state
  }
}

export const ProductEditScreen = () => {
  const navigate = useNavigate()

  const params = useParams()
  const { id: productId } = params
  const { state } = useContext(Store)
  const { userInfo } = state

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      loadingUpdate: false,
    })

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [images, setImages] = useState([])
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/products/${productId}`)
        setName(data.name)
        setSlug(data.slug)
        setPrice(data.price)
        setImage(data.image)
        setImages(data.images)
        setCategory(data.category)
        setCountInStock(data.countInStock)
        setBrand(data.brand)
        setDescription(data.description)
        dispatch({ type: 'FETCH_SUCCESS' })
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) })
      }
    }
    fetchData()
  }, [productId])

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      dispatch({ type: 'UPDATE_REQUEST' })
      await axios.put(
        `/api/products/${productId}`,
        {
          _id: productId,
          name,
          slug,
          price,
          image,
          images,
          category,
          brand,
          countInStock,
          description,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      )
      dispatch({ type: 'UPDATE_SUCCESS' })
      toast.success('Product update successfully')
      navigate('/admin/products')
    } catch (err) {
      toast.error(getError(err))
      dispatch({ type: 'UPDATE_FAIL' })
    }
  }

  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0]
    const bodyFormData = new FormData()
    bodyFormData.append('file', file)
    try {
      dispatch({ type: 'UPLPAD_REQUEST' })

      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      })
      dispatch({ type: 'UPLPAD_SUCCESS' })
      if (forImages) {
        setImages([...images, data.secure_url])
      } else {
        setImage(data.secure_url)
      }
      toast.success('Image uploaded successfully, click Update to appty it')
    } catch (err) {
      toast.error(getError(err))
      dispatch({ type: 'UPLPAD_FAIL', payload: getError(err) })
    }
  }
  const deleteFileHandler = async (fileName) => {
    setImages(images.filter((x) => x !== fileName))
    toast.success('Image Removed successfully. clic Update to apply it')
    try {
    } catch (err) {
      toast.error(getError(err))
    }
  }
  return (
    <div className='small-container'>
      <Helmet>
        <title>Product Edit {productId}</title>
      </Helmet>
      <h1 className='title'>Edit Product:</h1>
      <h3>{productId}</h3>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant='danger'>{error}</MessageBox>
      ) : (
        <form
          className='small-container edit-item div-bg'
          onSubmit={submitHandler}
        >
          <label className='label'>
            <input
              type='text'
              value={name}
              required
              placeholder='e.g. Mexican Tarantula'
              onChange={(e) => setName(e.target.value)}
            />
            <span>Name</span>
            <span className='box-underline'></span>
          </label>

          <label className='label'>
            <input
              type='text'
              value={slug}
              required
              placeholder='e.g. mexican-tarantula-new'
              onChange={(e) => setSlug(e.target.value)}
            />
            <span>Slug</span>
            <span className='box-underline'></span>
          </label>
          <label className='label'>
            <input
              type='text'
              value={price}
              required
              placeholder='e.g. 23'
              onChange={(e) => setPrice(e.target.value)}
            />
            <span>Price</span>
            <span className='box-underline'></span>
          </label>
          <label className='label'>
            <input
              type='text'
              value={image}
              required
              placeholder='e.g. http://me.com/my-image.jpg'
              onChange={(e) => setImage(e.target.value)}
            />
            <span>Image</span>
            <span className='box-underline'></span>
          </label>

          <label className='label upload-file'>
            <input type='file' onChange={uploadFileHandler} />
            <span>Upoad Image</span>
            <span className='box-underline'></span>
            {loadingUpload && <LoadingBox />}
          </label>

          <div className='additional-images'>
            <span>Additional Images</span>
            {images.length === 0 && <MessageBox>No image</MessageBox>}
            <div>
              {images.map((x) => (
                <p key={x}>
                  {x}{' '}
                  <button
                    className='btn-icon'
                    onClick={() => deleteFileHandler(x)}
                  >
                    <i className='fa fa-times-circle'></i>
                  </button>
                </p>
              ))}
            </div>
          </div>

          <label className='label upload-file'>
            <input type='file' onChange={(e) => uploadFileHandler(e, true)} />
            <span>Upload Additional Images</span>
            <span className='box-underline'></span>
            {loadingUpload && <LoadingBox />}
          </label>

          <label className='label'>
            <input
              type='text'
              value={category}
              required
              placeholder='e.g. spiders'
              onChange={(e) => setCategory(e.target.value)}
            />
            <span>Category</span>
            <span className='box-underline'></span>
          </label>

          <label className='label'>
            <input
              type='text'
              value={brand}
              required
              placeholder='e.g. tarantula'
              onChange={(e) => setBrand(e.target.value)}
            />
            <span>Brand</span>
            <span className='box-underline'></span>
          </label>

          <label className='label'>
            <input
              type='text'
              value={countInStock}
              required
              placeholder='e.g. 100'
              onChange={(e) => setCountInStock(e.target.value)}
            />
            <span>Count In Stock</span>
            <span className='box-underline'></span>
          </label>

          <label className='label textarea'>
            <span>Description</span>
            <textarea
              type='text'
              value={description}
              required
              placeholder='e.g. description'
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className='box-underline'></span>
          </label>

          <div className='mb-2'>
            <button disabled={loadingUpdate} type='submit'>
              Update
            </button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </form>
      )}
    </div>
  )
}
