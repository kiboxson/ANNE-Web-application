# Cart Collection in MongoDB Atlas

## Overview
The cart collection is already implemented and fully functional in your MongoDB Atlas database. All add-to-cart products are automatically saved to this collection.

## Database Details
- **Database**: `passkey`
- **Collection**: `carts`
- **Connection**: MongoDB Atlas Cluster0

## Cart Schema Structure

```javascript
{
  userId: String,        // Unique Firebase UID
  items: [
    {
      id: String,        // Product ID
      title: String,     // Product name
      price: Number,     // Product price
      quantity: Number,  // Quantity in cart (min: 1)
      image: String      // Product image URL (optional)
    }
  ],
  updatedAt: Date       // Last modification timestamp
}
```

## Available API Endpoints

### 1. Get User Cart
```
GET /api/cart/:userId
```
- Retrieves user's cart
- Creates empty cart if doesn't exist

### 2. Add Product to Cart
```
POST /api/cart/:userId/add
Body: {
  product: {
    id: "product-id",
    title: "Product Name",
    price: 29.99,
    image: "image-url"
  },
  quantity: 2
}
```
- Adds new product or updates quantity if exists

### 3. Update Item Quantity
```
PUT /api/cart/:userId/item/:itemId
Body: { quantity: 5 }
```
- Updates specific item quantity

### 4. Remove Item from Cart
```
DELETE /api/cart/:userId/item/:itemId
```
- Removes specific item from cart

### 5. Clear Entire Cart
```
DELETE /api/cart/:userId
```
- Removes all items from user's cart

## Features

✅ **User-Specific Storage**: Each user has their own cart identified by Firebase UID
✅ **Persistent Storage**: Cart data persists across sessions
✅ **Automatic Quantity Management**: Handles quantity updates and duplicates
✅ **Complete CRUD Operations**: Full create, read, update, delete functionality
✅ **Error Handling**: Comprehensive error handling and validation
✅ **Logging**: Detailed logging for debugging and monitoring

## Testing

### Run Cart Collection Tests
```bash
# Test all cart functionality
node test-cart.js

# Verify collection status
node verify-cart-collection.js
```

### Manual Testing
1. Start the backend server: `node index.js`
2. Use the test scripts or make API calls directly
3. Check MongoDB Atlas dashboard to see cart data

## Integration Status

The cart collection is fully integrated with:
- ✅ Frontend CartContext
- ✅ User authentication (Firebase)
- ✅ Product management system
- ✅ Order processing
- ✅ Guest to user cart transfer

## Data Flow

1. **Guest Users**: Cart stored locally in browser
2. **Logged-in Users**: Cart automatically synced to MongoDB Atlas
3. **Login Event**: Guest cart items transferred to user's MongoDB cart
4. **Logout Event**: Cart cleared from local state

## Monitoring

- All cart operations are logged with detailed information
- MongoDB Atlas provides built-in monitoring and analytics
- Error tracking includes stack traces and request details

## Security

- User identification through Firebase UID
- Input validation for all cart operations
- CORS protection for API endpoints
- Secure MongoDB Atlas connection with authentication
