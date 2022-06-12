import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: String, required: true },
    shippingPrice: { type: String, required: true },
    taxPrice: { type: String, required: true },
    totalPrice: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    isPayd: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDeliverd: { type: Boolean, default: false },
    deliverdAt: { type: Date },
  },
  {
    timestamps: true,
  }
)
const Order = mongoose.model('Order', orderSchema)
export default Order
