import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store } from '../Store'
import { Searchbox } from './Searchbox'

export const Navbarbar = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store)
  const { cart, userInfo } = state

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' })
    localStorage.removeItem('userInfo')
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('paymentMethod')
    window.location.href = '/signin'
  }

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false)

  return (
    <div className='navbar div-bg'>
      <div className='navbar-row'>
        <button
          className='btn-icon'
          onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
        >
          <i className='fas fa-bars'></i>
        </button>
        <Link to='/'>
          <div className='sign'>
            <span className='fast-flicker'>B</span>uy
            <span className='flicker'>B</span>ug
          </div>
        </Link>
        <div className='nav-search'>
          <Searchbox />
        </div>
        <div className='nav-right-panel'>
          <Link to='/cart'>
            Cart
            {cart.cartItems.length > 0 && (
              <span className='cart-items-number'>
                {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
              </span>
            )}
          </Link>
          {userInfo ? (
            <div className='menu-item'>
              {userInfo.name}

              <ul className='drop-menu'>
                <li className='drop-menu-item'>
                  <Link to='/profile'>User {'\xa0'}Profile</Link>
                </li>

                <li className='drop-menu-item'>
                  <Link to='/orderhistory'>Order{'\xa0'}History</Link>
                </li>
                <hr />
                <li className='drop-menu-item'>
                  <Link to='#signout' onClick={signoutHandler}>
                    Sign Out
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <Link to='/signin'>Sign In</Link>
          )}
          {userInfo && userInfo.isAdmin && (
            <div className='menu-item'>
              Admin
              <ul className='drop-menu'>
                <li className='drop-menu-item'>
                  <Link to='/admin/dashboard'>Dashboard</Link>
                </li>
                <li className='drop-menu-item'>
                  <Link to='/admin/products'>Products</Link>
                </li>
                <li className='drop-menu-item'>
                  <Link to='/admin/orders'>Orders</Link>
                </li>
                <li className='drop-menu-item'>
                  <Link to='/admin/users'>Users</Link>
                </li>
                <li className='drop-menu-item'>
                  <Link to='/admin/support'>Support</Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

{
  /* <Nav className='flex-column text-white w-100 p-2'>
<Nav.Item>
  <strong>Categories</strong>
</Nav.Item>
{categories.map((category) => (
  <Nav.Item key={category}>
    <LinkContainer
      to={`/search?category=${category}`}
      onClick={() => setSidebarIsOpen(false)}
    >
      <Nav.Link>{category}</Nav.Link>
    </LinkContainer>
  </Nav.Item>
))}
</Nav> */
}
