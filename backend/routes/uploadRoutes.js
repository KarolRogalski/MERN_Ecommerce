import express from 'express'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import streamifier from 'streamifier'
import { isAuth, isAdmin } from '../utils.js'

const upload = multer()

const uploadRouter = express.Router()

uploadRouter.post(
  '/',
  isAuth,
  isAdmin,
  upload.single('file'),
  async (req, res) => {
    console.log('req')
    cloudinary.config({
      cloud_name: process.env.CLOURINARY_CLOUD_NAME,
      api_key: process.env.CLOURINARY_API_KEY,
      api_secret: process.env.CLOURINARY_API_SECRET,
    })
    const streamUpload = (req) => {
      console.log('first' + req)
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            console.log('result')
            resolve(result)
          } else {
            console.log(error)
            reject(error)
          }
        })
        streamifier.createReadStream(req.file.buffer).pipe(stream)
      })
    }
    const result = await streamUpload(req)
    res.send(result)
  }
)

export default uploadRouter
