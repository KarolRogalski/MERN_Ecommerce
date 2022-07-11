import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import socketIOClient from 'socket.io-client'

const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:5000'
    : window.location.host

export const ChatBox = (props) => {
  const { userInfo } = props
  const uiMessagesRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [messages, setMessages] = useState([
    { name: 'Admin', body: 'Hello there, Please ask your question' },
  ])

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      })
      if (socket) {
        socket.emit('onLogin', {
          _id: userInfo._id,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
        })
        socket.on('message', (data) => {
          setMessages([...messages, { body: data.body, name: data.name }])
        })
      }
    }
  }, [messages, isOpen, socket, userInfo])

  const supportHandler = () => {
    setIsOpen(true)
    const sk = socketIOClient(ENDPOINT)
    setSocket(sk)
  }
  const submitHandler = (e) => {
    e.preventDefault()
    if (!messageBody.trim()) {
      toast.error('Please type message')
    } else {
      setMessages([...messages, { body: messageBody, name: userInfo.name }])
      setMessageBody('')
      setTimeout(() => {
        socket.emit('onMessage', {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: userInfo._id,
        })
      }, 1000)
    }
  }

  const closeHandler = () => {
    setIsOpen(false)
  }

  return (
    <div className='chatbox'>
      {!isOpen ? (
        <button className='btn-round' type='button' onClick={supportHandler}>
          <i className='fa fa-comment'></i>
        </button>
      ) : (
        <div className='card card-body'>
          <div className='row'>
            <strong>Support</strong>
            <button
              className='btn-round close'
              type='button'
              onClick={closeHandler}
            >
              <i className='fa fa-times' />
            </button>
          </div>
          <ul ref={uiMessagesRef}>
            {messages.map((msg, index) => (
              <li key={index}>
                <strong>{`${msg.name}: `}</strong>
                {msg.body}
              </li>
            ))}
          </ul>
          <div>
            <form onSubmit={submitHandler} className='row'>
              <label className='label'>
                <input
                  type='text'
                  value={messageBody}
                  required
                  placeholder='e.g. I need help with...'
                  onChange={(e) => setMessageBody(e.target.value)}
                />
                <span>message</span>
                <span className='box-underline'></span>
              </label>
              <button type='submit'>Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
