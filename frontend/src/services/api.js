const API_URL = "https://cozy-noor-1.onrender.com/api";

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();

  console.log("PRODUCT API DATA:", data);

  return data;
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await response.json();

  console.log("PRODUCT BY ID:", data);

  return data;
};