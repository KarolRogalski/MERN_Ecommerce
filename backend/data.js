import bcrypt from 'bcryptjs'

const data = {
  users: [
    {
      name: 'Karol',
      email: 'qwerty@qwerty.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true,
    },
    {
      name: 'John',
      email: 'test@test.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    },
  ],
  products: [
    {
      name: 'House Fly',
      slug: 'house-fly',
      category: 'Flies',
      image: '/images/house_fly.jpg',
      price: 10,
      countInStock: 0,
      brand: 'Flies',
      rating: 4.5,
      numReviews: 10,
      description: 'common house fly',
    },
    {
      name: 'Daddy Long Leg Spider',
      slug: 'daddy-long-leg-spider',
      category: 'Spiders',
      image: '/images/DaddyLongLegs.jpg',
      price: 50,
      countInStock: 20,
      brand: 'Spiders',
      rating: 4,
      numReviews: 10,
      description: 'high quality Daddy long legs spider',
    },
    {
      name: 'Sun Beetle',
      slug: 'sun-beetle',
      category: 'Beetles',
      image: '/images/sun_beetles.jpg',
      price: 55,
      countInStock: 15,
      brand: 'Beetles',
      rating: 4.5,
      numReviews: 14,
      description: 'nie sun beetle',
    },
    {
      name: 'Mexican Redknee Tarantula',
      slug: 'mexican-redknee-tarantula',
      category: 'Spiders',
      image: '/images/mexican_redknee_tarantula.jpg',
      price: 150,
      countInStock: 20,
      brand: 'Tarantula',
      rating: 4,
      numReviews: 10,
      description: 'Very hairy Mexican Redknee Tarantula',
    },
  ],
}
export default data
