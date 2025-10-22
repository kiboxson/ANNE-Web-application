# Cart Collection Data Structure in MongoDB Atlas

## 📊 **Cart Collection Schema**

When a product is added to the cart, the following data structure is saved in the `carts` collection in your MongoDB Atlas database:

### **Collection Name**: `carts`
### **Database**: `passkey`

## 🗂️ **Document Structure**

Each cart document in MongoDB contains:

```javascript
{
  "_id": ObjectId("..."),           // MongoDB auto-generated ID
  "userId": "firebase_user_uid",    // Firebase User UID (unique identifier)
  "items": [                        // Array of cart items
    {
      "id": "product_id",           // Product ID (string)
      "title": "Product Name",      // Product title/name (string)
      "price": 29.99,              // Product price (number)
      "quantity": 2,               // Quantity in cart (number, min: 1)
      "image": "image_url"         // Product image URL (string, can be null)
    }
  ],
  "updatedAt": ISODate("..."),     // Last update timestamp
  "__v": 0                         // MongoDB version key
}
```

## 📝 **Detailed Field Descriptions**

### **Cart Document Level:**
- **`_id`**: MongoDB auto-generated unique identifier for the cart document
- **`userId`**: Firebase User UID (unique per user) - used to identify which user owns this cart
- **`items`**: Array containing all products added to the cart
- **`updatedAt`**: Timestamp of when the cart was last modified
- **`__v`**: MongoDB version key for document versioning

### **Cart Item Level (inside `items` array):**
- **`id`**: Product identifier (string) - matches the product ID from your products collection
- **`title`**: Product name/title (string) - displayed name of the product
- **`price`**: Product price (number) - stored as a numeric value for calculations
- **`quantity`**: Number of items of this product in the cart (number, minimum 1)
- **`image`**: Product image URL (string or null) - can be null if no image is provided

## 🔄 **How Data is Saved**

### **When Adding a Product:**

1. **Frontend sends this data:**
```javascript
{
  product: {
    id: "12345",
    title: "Wireless Headphones",
    price: 79.99,
    image: "https://example.com/headphones.jpg"
  },
  quantity: 1
}
```

2. **Backend processes and saves:**
```javascript
// New item structure created in backend
const newItem = {
  id: product.id,                    // "12345"
  title: product.title,              // "Wireless Headphones"
  price: Number(product.price) || 0, // 79.99
  quantity: quantity,                // 1
  image: product.image || null       // "https://example.com/headphones.jpg"
};
```

3. **Final MongoDB document:**
```javascript
{
  "_id": ObjectId("671234567890abcdef123456"),
  "userId": "eOWzgdSCQDNXPyrorChBbkvaTrZ2",
  "items": [
    {
      "id": "12345",
      "title": "Wireless Headphones",
      "price": 79.99,
      "quantity": 1,
      "image": "https://example.com/headphones.jpg"
    }
  ],
  "updatedAt": ISODate("2025-10-22T08:42:00.000Z"),
  "__v": 0
}
```

## 🔄 **Cart Operations**

### **Adding Same Product Again:**
- If the same product ID already exists in the cart, only the `quantity` is updated
- No duplicate items are created

### **Multiple Products:**
```javascript
{
  "_id": ObjectId("671234567890abcdef123456"),
  "userId": "eOWzgdSCQDNXPyrorChBbkvaTrZ2",
  "items": [
    {
      "id": "12345",
      "title": "Wireless Headphones",
      "price": 79.99,
      "quantity": 2,
      "image": "https://example.com/headphones.jpg"
    },
    {
      "id": "67890",
      "title": "Smartphone Case",
      "price": 19.99,
      "quantity": 1,
      "image": "https://example.com/case.jpg"
    }
  ],
  "updatedAt": ISODate("2025-10-22T08:45:00.000Z"),
  "__v": 0
}
```

## 🔍 **Data Validation**

The backend validates the following before saving:

### **Required Fields:**
- ✅ `userId` must be provided
- ✅ `product.id` must exist
- ✅ `product.title` must be a non-empty string
- ✅ `product.price` must be a valid number
- ✅ `quantity` must be a positive integer (minimum 1)

### **Optional Fields:**
- 🔄 `product.image` can be null or empty
- 🔄 If price is invalid, it defaults to 0

## 📊 **Example Real Cart Data**

Here's what you'll see in MongoDB Atlas when you browse the `carts` collection:

```javascript
// Document 1 - User with 3 different products
{
  "_id": ObjectId("671234567890abcdef123456"),
  "userId": "firebase_uid_user1",
  "items": [
    {
      "id": "prod_001",
      "title": "iPhone 15 Pro",
      "price": 999.99,
      "quantity": 1,
      "image": "https://example.com/iphone15.jpg"
    },
    {
      "id": "prod_002", 
      "title": "AirPods Pro",
      "price": 249.99,
      "quantity": 2,
      "image": "https://example.com/airpods.jpg"
    },
    {
      "id": "prod_003",
      "title": "Phone Case",
      "price": 29.99,
      "quantity": 1,
      "image": null
    }
  ],
  "updatedAt": ISODate("2025-10-22T08:42:15.123Z"),
  "__v": 0
}

// Document 2 - Different user with 1 product
{
  "_id": ObjectId("671234567890abcdef789012"),
  "userId": "firebase_uid_user2", 
  "items": [
    {
      "id": "prod_004",
      "title": "Gaming Laptop",
      "price": 1299.99,
      "quantity": 1,
      "image": "https://example.com/laptop.jpg"
    }
  ],
  "updatedAt": ISODate("2025-10-22T08:40:30.456Z"),
  "__v": 0
}
```

## 🔧 **How to View This Data**

### **In MongoDB Atlas:**
1. Go to MongoDB Atlas Dashboard
2. Navigate to **Database** → **Browse Collections**
3. Select database: `passkey`
4. Select collection: `carts`
5. View the documents

### **Using Debug Tools:**
1. Login to your application
2. Add some products to cart
3. Go to Cart page → Click **🐛 Debug**
4. Click **🔍 Test MongoDB Health** to see cart count
5. Click **🧪 Test Cart API** to see your cart data

This structure ensures that each user has their own cart with all the necessary product information stored persistently in MongoDB Atlas!
