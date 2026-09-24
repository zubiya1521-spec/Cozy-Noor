import { useEffect, useState } from "react";
import "./Admin.css";

const API_URL = "https://cozy-noor-1.onrender.com/api";

function Admin() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [loading, setLoading] = useState(false);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    colours: "",
    sizes: "",
    customization: false,
    makingTime: "10–15 days",
    images: [],
  });

  const [offerForm, setOfferForm] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    applicability: "all",
    productIds: [],
    categories: [],
    minimumOrderAmount: "",
    maximumDiscount: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const [settings, setSettings] = useState({
    storeName: "Cozy Noor",
    deliveryTime: "10–15 days",
    codEnabled: true,
    onlinePaymentEnabled: true,
    customOrdersEnabled: true,
    instagram: "@the.cozy.noor",
  });

  /* =====================================================
     COMMON FETCH HELPER
  ===================================================== */

  const getAdminToken = () => {
    const stored = localStorage.getItem("cozyNoorAdmin");

    if (!stored) return "";

    try {
      const parsed = JSON.parse(stored);
      return parsed?.token || stored;
    } catch {
      return stored;
    }
  };

  const adminFetch = async (url, options = {}) => {
    const token = getAdminToken();

    if (!token) {
      localStorage.removeItem("cozyNoorAdmin");
      window.location.href = "/admin/login";
      throw new Error("Admin authentication required");
    }

    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const getData = async (endpoint) => {
    const response = await adminFetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  /* =====================================================
     FETCH PRODUCTS
  ===================================================== */

  const fetchProducts = async () => {
    try {
      const data = await getData("/products");
      setProducts(data);
    } catch (error) {
      console.error("Products error:", error);
      setProducts([]);
    }
  };

  /* =====================================================
     FETCH ORDERS
  ===================================================== */

  const fetchOrders = async () => {
    try {
      const data = await getData("/orders");
      setOrders(data);
    } catch (error) {
      console.error("Orders error:", error);
      setOrders([]);
    }
  };

  /* =====================================================
     FETCH CUSTOMERS
  ===================================================== */

  const fetchCustomers = async () => {
    try {
      const data = await getData("/users");
      setCustomers(data);
    } catch (error) {
      console.error("Customers error:", error);
      setCustomers([]);
    }
  };

  /* =====================================================
     FETCH CATEGORIES
  ===================================================== */

  const fetchCategories = async () => {
    try {
      const data = await getData("/categories");
      setCategories(data);
    } catch (error) {
      console.error("Categories error:", error);
      setCategories([]);
    }
  };

  /* =====================================================
     FETCH MESSAGES
  ===================================================== */

  const fetchMessages = async () => {
    try {
      const data = await getData("/messages");
      setMessages(data);
    } catch (error) {
      console.error("Messages error:", error);
      setMessages([]);
    }
  };

  /* =====================================================
     FETCH OFFERS
  ===================================================== */

  const fetchOffers = async () => {
    try {
      const data = await getData("/offers");
      setOffers(data);
    } catch (error) {
      console.error("Offers error:", error);
      setOffers([]);
    }
  };

  /* =====================================================
     FETCH CUSTOM ORDERS
  ===================================================== */

  const fetchCustomOrders = async () => {
    try {
      const data = await getData("/custom-orders");
      setCustomOrders(data);
    } catch (error) {
      console.error("Custom orders error:", error);
      setCustomOrders([]);
    }
  };

  /* =====================================================
     FETCH REVIEWS
  ===================================================== */

 const fetchReviews = async () => {
  try {
    const data = await getData("/reviews/admin/all");
    setReviews(data);
  } catch (error) {
    console.error("Reviews error:", error);
    setReviews([]);
  }
};

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    fetchCategories();
    fetchMessages();
    fetchOffers();
    fetchCustomOrders();
    fetchReviews();
  }, []);

  /* =====================================================
     SETTINGS LOAD
  ===================================================== */

  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "cozyNoorAdminSettings"
    );

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Settings load error:", error);
      }
    }
  }, []);

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =====================================================
     CATEGORY CHANGE
  ===================================================== */

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;

    setCategoryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     IMAGE UPLOAD
  ===================================================== */

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await adminFetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Image upload failed"
        );
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, data.imageUrl],
      }));

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  /* =====================================================
     PRODUCT FORM RESET
  ===================================================== */

  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
      colours: "",
      sizes: "",
      customization: false,
      makingTime: "10–15 days",
      images: [],
    });

    setEditingProductId(null);
  };

  /* =====================================================
     PRODUCT DATA
  ===================================================== */

  const getProductPayload = () => {
    return {
      name: productForm.name.trim(),
      price: Number(productForm.price),
      description: productForm.description.trim(),
      category: productForm.category,
      stock: Number(productForm.stock || 0),

      colours: productForm.colours
        ? productForm.colours
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

      sizes: productForm.sizes
        ? productForm.sizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

      customization: productForm.customization,
      makingTime: productForm.makingTime,
      images: productForm.images,
    };
  };

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await adminFetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getProductPayload()),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Product could not be added"
        );
      }

      alert("Product added successfully! ❤️");

      resetProductForm();
      setShowAddProduct(false);
      await fetchProducts();
    } catch (error) {
      console.error("Add product error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     EDIT PRODUCT
  ===================================================== */

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);

    setProductForm({
      name: product.name || "",
      price: product.price ?? "",
      description: product.description || "",
      category: product.category || "",
      stock: product.stock ?? "",
      colours: product.colours?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      customization: product.customization || false,
      makingTime: product.makingTime || "10–15 days",
      images: product.images || [],
    });

    setShowAddProduct(true);
  };

  /* =====================================================
     UPDATE PRODUCT
  ===================================================== */

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editingProductId) return;

    try {
      setLoading(true);

      const response = await adminFetch(
        `${API_URL}/products/${editingProductId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getProductPayload()),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Product update failed"
        );
      }

      alert("Product updated successfully! ✅");

      resetProductForm();
      setShowAddProduct(false);
      await fetchProducts();
    } catch (error) {
      console.error("Update product error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DELETE PRODUCT
  ===================================================== */

  const deleteProduct = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Delete failed"
        );
      }

      alert("Product deleted successfully!");
      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     ADD CATEGORY
  ===================================================== */

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryForm.name.trim()) {
      alert("Please enter category name.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminFetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Category could not be added"
        );
      }

      alert("Category added successfully! ❤️");

      setCategoryForm({
        name: "",
        description: "",
        image: "",
      });
      setEditingCategoryId(null);
      setShowAddCategory(false);
      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     EDIT CATEGORY
  ===================================================== */

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
    });
    setShowAddCategory(true);
  };

  /* =====================================================
     CATEGORY IMAGE UPLOAD
  ===================================================== */

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await adminFetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category image upload failed");
      }

      setCategoryForm((prev) => ({
        ...prev,
        image: data.imageUrl,
      }));

      alert("Category image uploaded successfully! ❤️");
    } catch (error) {
      console.error("Category image upload error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  /* =====================================================
     UPDATE CATEGORY
  ===================================================== */

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editingCategoryId) return;

    if (!categoryForm.name.trim()) {
      alert("Please enter category name.");
      return;
    }

    try {
      setLoading(true);

      const response = await adminFetch(
        `${API_URL}/categories/${editingCategoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: categoryForm.name.trim(),
            description: categoryForm.description.trim(),
            image: categoryForm.image.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category update failed");
      }

      alert("Category updated successfully! ✅");

      setCategoryForm({
        name: "",
        description: "",
        image: "",
      });
      setEditingCategoryId(null);
      setShowAddCategory(false);
      await fetchCategories();
    } catch (error) {
      console.error("Category update error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     DELETE CATEGORY
  ===================================================== */

  const deleteCategory = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category?"
      )
    ) {
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Category delete failed"
        );
      }

      alert("Category deleted successfully!");
      await fetchCategories();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await adminFetch(
        `${API_URL}/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Status update failed"
        );
      }

      alert("Order status updated!");
      await fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     DELIVERY CHARGE
  ===================================================== */

  const updateDeliveryCharge = async (orderId) => {
    const charge = window.prompt(
      "Enter delivery charge for this order:"
    );

    if (charge === null) return;

    const deliveryCharge = Number(charge);

    if (
      Number.isNaN(deliveryCharge) ||
      deliveryCharge < 0
    ) {
      alert("Please enter a valid delivery charge.");
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/orders/${orderId}/delivery-charge`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryCharge,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Delivery charge update failed"
        );
      }

      alert("Delivery charge updated successfully!");
      await fetchOrders();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     DELETE ALL ORDERS
  ===================================================== */

  const deleteAllOrders = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete ALL orders? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await adminFetch(
        `${API_URL}/orders/admin/delete-all`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete all orders"
        );
      }

      alert(
        `${data.deletedCount || 0} orders deleted successfully!`
      );

      await fetchOrders();
    } catch (error) {
      console.error("Delete all orders error:", error);
      alert(error.message);
    }
  };

  /* =====================================================
     MESSAGE READ / UNREAD
  ===================================================== */

  const toggleMessageRead = async (message) => {
    try {
      const response = await adminFetch(
        `${API_URL}/messages/${message._id}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Message status update failed"
        );
      }

      await fetchMessages();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     DELETE MESSAGE
  ===================================================== */

  const deleteMessage = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this message?"
      )
    ) {
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/messages/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Message delete failed"
        );
      }

      alert("Message deleted!");
      await fetchMessages();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     OFFER RESET
  ===================================================== */

  const resetOfferForm = () => {
    setOfferForm({
      name: "",
      code: "",
      discountType: "percentage",
      discountValue: "",
      applicability: "all",
      productIds: [],
      categories: [],
      minimumOrderAmount: "",
      maximumDiscount: "",
      startDate: "",
      endDate: "",
      active: true,
    });

    setEditingOffer(null);
  };

  /* =====================================================
     OFFER PRODUCT
  ===================================================== */

  const toggleOfferProduct = (productId) => {
    setOfferForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(
            (id) => id !== productId
          )
        : [...prev.productIds, productId],
    }));
  };

  /* =====================================================
     OFFER CATEGORY
  ===================================================== */

  const toggleOfferCategory = (categoryName) => {
    setOfferForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(
            (name) => name !== categoryName
          )
        : [...prev.categories, categoryName],
    }));
  };

  /* =====================================================
     SAVE OFFER
  ===================================================== */

  const handleOfferSubmit = async (e) => {
    e.preventDefault();

    if (!offerForm.name.trim()) {
      alert("Please enter offer name.");
      return;
    }

    if (!offerForm.code.trim()) {
      alert("Please enter offer code.");
      return;
    }

    if (
      !offerForm.discountValue ||
      Number(offerForm.discountValue) <= 0
    ) {
      alert("Please enter a valid discount.");
      return;
    }

    if (
      offerForm.applicability === "product" &&
      offerForm.productIds.length === 0
    ) {
      alert("Select at least one product.");
      return;
    }

    if (
      offerForm.applicability === "category" &&
      offerForm.categories.length === 0
    ) {
      alert("Select at least one category.");
      return;
    }

    try {
      setLoading(true);

      const offerData = {
        name: offerForm.name.trim(),
        code: offerForm.code.trim().toUpperCase(),
        discountType: offerForm.discountType,
        discountValue: Number(offerForm.discountValue),
        applicability: offerForm.applicability,
        productIds: offerForm.productIds,
        categories: offerForm.categories,
        minimumOrderAmount: Number(
          offerForm.minimumOrderAmount || 0
        ),
        maximumDiscount:
          offerForm.maximumDiscount === ""
            ? null
            : Number(offerForm.maximumDiscount),
        startDate: offerForm.startDate
          ? new Date(
              offerForm.startDate
            ).toISOString()
          : null,
        endDate: offerForm.endDate
          ? new Date(
              offerForm.endDate
            ).toISOString()
          : null,
        active: offerForm.active,
      };

      const url = editingOffer
        ? `${API_URL}/offers/${editingOffer._id}`
        : `${API_URL}/offers`;

      const method = editingOffer ? "PUT" : "POST";

      const response = await adminFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Offer could not be saved"
        );
      }

      alert(
        editingOffer
          ? "Offer updated successfully! ✅"
          : "Offer created successfully! 🎉"
      );

      resetOfferForm();
      setShowOfferForm(false);
      await fetchOffers();
    } catch (error) {
      console.error("Offer error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     EDIT OFFER
  ===================================================== */

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);

    setOfferForm({
      name: offer.name || "",
      code: offer.code || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue ?? "",
      applicability: offer.applicability || "all",

      productIds:
        offer.productIds?.map((item) =>
          typeof item === "object"
            ? item._id
            : item
        ) || [],

      categories: offer.categories || [],

      minimumOrderAmount:
        offer.minimumOrderAmount ?? "",

      maximumDiscount:
        offer.maximumDiscount ?? "",

      startDate: offer.startDate
        ? new Date(offer.startDate)
            .toISOString()
            .slice(0, 16)
        : "",

      endDate: offer.endDate
        ? new Date(offer.endDate)
            .toISOString()
            .slice(0, 16)
        : "",

      active: offer.active !== false,
    });

    setShowOfferForm(true);
  };

  /* =====================================================
     DELETE OFFER
  ===================================================== */

  const deleteOffer = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this offer?"
      )
    ) {
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/offers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Offer delete failed"
        );
      }

      alert("Offer deleted successfully!");
      await fetchOffers();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     CUSTOM ORDER STATUS
  ===================================================== */

  const updateCustomOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      const response = await adminFetch(
        `${API_URL}/custom-orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Custom order status update failed"
        );
      }

      alert("Custom order status updated!");
      await fetchCustomOrders();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     DELETE CUSTOM ORDER
  ===================================================== */

  const deleteCustomOrder = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this custom order?"
      )
    ) {
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/custom-orders/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Custom order delete failed"
        );
      }

      alert("Custom order deleted!");
      await fetchCustomOrders();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };
const toggleReviewApproval = async (reviewId, approved) => {
  try {
    const response = await adminFetch(
      `${API_URL}/reviews/${reviewId}/approval`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved: !approved,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update review");
    }

    await fetchReviews();
  } catch (error) {
    console.error("Review approval error:", error);
    alert("Failed to update review approval.");
  }
};
  /* =====================================================
     DELETE REVIEW
  ===================================================== */

  const deleteReview = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this review?"
      )
    ) {
      return;
    }

    try {
      const response = await adminFetch(
        `${API_URL}/reviews/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Review delete failed"
        );
      }

      alert("Review deleted!");
      await fetchReviews();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  /* =====================================================
     SETTINGS
  ===================================================== */

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem(
      "cozyNoorAdminSettings",
      JSON.stringify(settings)
    );

    alert("Settings saved successfully! ✅");
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("cozyNoorAdmin");
    window.location.href = "/admin/login";
  };

  /* =====================================================
     DASHBOARD
  ===================================================== */

  const renderDashboard = () => {
    const pendingOrders = orders.filter(
      (order) =>
        order.orderStatus === "Pending" ||
        order.orderStatus === "Confirmed"
    ).length;

    const unreadMessages = messages.filter(
      (message) => !message.read
    ).length;

    const pendingCustomOrders = customOrders.filter(
      (order) =>
        order.status === "Pending" ||
        order.status === "New"
    ).length;

    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Dashboard</h1>
            <p>
              Welcome back to Cozy Noor Admin.
            </p>
          </div>

          <div className="admin-profile">
            <div className="admin-profile-avatar">
              CN
            </div>
            <span>Admin</span>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
            <small>Products in store</small>
          </div>

          <div className="admin-stat-card">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
            <small>Customer orders</small>
          </div>

          <div className="admin-stat-card">
            <span>Customers</span>
            <strong>{customers.length}</strong>
            <small>Registered customers</small>
          </div>

          <div className="admin-stat-card">
            <span>Categories</span>
            <strong>{categories.length}</strong>
            <small>Store categories</small>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Store Overview</h2>
              <p>
                Current activity of your store.
              </p>
            </div>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <span>Pending Orders</span>
              <strong>{pendingOrders}</strong>
              <small>Need attention</small>
            </div>

            <div className="admin-stat-card">
              <span>Messages</span>
              <strong>{messages.length}</strong>
              <small>{unreadMessages} unread</small>
            </div>

            <div className="admin-stat-card">
              <span>Custom Orders</span>
              <strong>{customOrders.length}</strong>
              <small>
                {pendingCustomOrders} pending
              </small>
            </div>

            <div className="admin-stat-card">
              <span>Reviews</span>
              <strong>{reviews.length}</strong>
              <small>Customer reviews</small>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your store quickly.</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <button
              className="admin-btn"
              onClick={() => {
                resetProductForm();
                setActiveSection("products");
                setShowAddProduct(true);
              }}
            >
              + Add Product
            </button>

            <button
              className="admin-btn secondary"
              onClick={() =>
                setActiveSection("orders")
              }
            >
              View Orders
            </button>

            <button
              className="admin-btn secondary"
              onClick={() =>
                setActiveSection("custom-orders")
              }
            >
              Custom Orders
            </button>

            <button
              className="admin-btn secondary"
              onClick={() =>
                setActiveSection("messages")
              }
            >
              View Messages
            </button>

            <button
              className="admin-btn secondary"
              onClick={() => {
                resetOfferForm();
                setActiveSection("offers");
                setShowOfferForm(true);
              }}
            >
              Create Offer
            </button>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest orders received.</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">♡</div>
              <h3>No orders yet</h3>
              <p>
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {orders.slice(0, 5).map((order) => (
                <div
                  className="admin-order-card"
                  key={order._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        Order #
                        {order._id.slice(-6)}
                      </div>

                      <div className="admin-order-date">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : ""}
                      </div>
                    </div>

                    <span className="admin-status">
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Customer</span>
                      <strong>
                        {order.customerName}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Items</span>
                      <strong>
                        {order.items?.length || 0}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Total</span>
                      <strong>
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     PRODUCTS
  ===================================================== */

  const renderProducts = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Products</h1>
            <p>
              Manage all your Cozy Noor products.
            </p>
          </div>

          <button
            className="admin-btn"
            onClick={() => {
              if (showAddProduct) {
                resetProductForm();
                setShowAddProduct(false);
              } else {
                resetProductForm();
                setShowAddProduct(true);
              }
            }}
          >
            {showAddProduct
              ? "Close"
              : "+ Add Product"}
          </button>
        </div>

        {showAddProduct && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>
                  {editingProductId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>
                  Manage product information
                  without changing website code.
                </p>
              </div>
            </div>

            <form
              className="admin-form"
              onSubmit={
                editingProductId
                  ? handleUpdateProduct
                  : handleAddProduct
              }
            >
              <div className="admin-form-group">
                <label>Product Name</label>
                <input
                  name="name"
                  value={productForm.name}
                  onChange={handleChange}
                  placeholder="e.g. Crochet Rose Bouquet"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Price</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={handleChange}
                  placeholder="₹"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Category</label>

                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleChange}
                  required
                  className="admin-select"
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories
                    .filter(
                      (category) =>
                        category.active !== false
                    )
                    .map((category) => (
                      <option
                        key={category._id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Stock</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="admin-form-group">
                <label>Colours</label>
                <input
                  name="colours"
                  value={productForm.colours}
                  onChange={handleChange}
                  placeholder="Pink, White, Red"
                />
              </div>

              <div className="admin-form-group">
                <label>Sizes</label>
                <input
                  name="sizes"
                  value={productForm.sizes}
                  onChange={handleChange}
                  placeholder="Small, Medium, Large"
                />
              </div>

              <div className="admin-form-group">
                <label>Making Time</label>
                <input
                  name="makingTime"
                  value={productForm.makingTime}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label>Product Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                {productForm.images.length > 0 && (
                  <small>
                    {productForm.images.length} image
                    {productForm.images.length !== 1
                      ? "s"
                      : ""}{" "}
                    uploaded
                  </small>
                )}
              </div>

              <div className="admin-form-group full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleChange}
                  placeholder="Write product description..."
                  required
                />
              </div>

              <div className="admin-form-group full">
                <label>
                  <input
                    type="checkbox"
                    name="customization"
                    checked={
                      productForm.customization
                    }
                    onChange={handleChange}
                  />{" "}
                  Customization available
                </label>
              </div>

              <div className="admin-form-submit">
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={loading}
                >
                  {loading
                    ? editingProductId
                      ? "Updating..."
                      : "Saving..."
                    : editingProductId
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>All Products</h2>
              <p>
                {products.length} product
                {products.length !== 1 ? "s" : ""}{" "}
                available.
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">🧶</div>
              <h3>No products yet</h3>
              <p>
                Add your first crochet product above.
              </p>
            </div>
          ) : (
            <div className="admin-product-grid">
              {products.map((product) => (
                <div
                  className="admin-product-card"
                  key={product._id}
                >
                  <div className="admin-product-image">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                      />
                    ) : (
                      <span>🧶</span>
                    )}
                  </div>

                  <div className="admin-product-info">
                    <h3>{product.name}</h3>

                    <p className="admin-product-price">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </p>

                    <p>
                      Stock: {product.stock ?? 0}
                    </p>

                    <p>{product.category}</p>

                    <div className="admin-product-actions">
                      <button
                        onClick={() =>
                          handleEditProduct(product)
                        }
                        className="admin-btn"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(product._id)
                        }
                        className="admin-btn danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     ORDERS
  ===================================================== */

  const renderOrders = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Orders</h1>
            <p>
              Manage customer orders and delivery
              charges.
            </p>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>All Orders</h2>
              <p>
                {orders.length} order
                {orders.length !== 1 ? "s" : ""}{" "}
                received.
              </p>
            </div>

            {orders.length > 0 && (
              <button
                className="admin-btn danger"
                onClick={deleteAllOrders}
              >
                Delete All Orders
              </button>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">♡</div>
              <h3>No orders yet</h3>
              <p>
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {orders.map((order) => (
                <div
                  className="admin-order-card"
                  key={order._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        Order #
                        {order._id.slice(-6)}
                      </div>

                      <div className="admin-order-date">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )
                          : ""}
                      </div>
                    </div>

                    <span className="admin-status">
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Customer</span>
                      <strong>
                        {order.customerName}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Email</span>
                      <strong>
                        {order.email}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Phone</span>
                      <strong>
                        {order.phone}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Payment</span>
                      <strong>
                        {order.paymentMethod ||
                          "COD"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Product Amount</span>
                      <strong>
                        ₹
                        {Number(
                          order.subtotal || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {Number(order.discountAmount || 0) >
                      0 && (
                      <div className="admin-order-detail">
                        <span>Discount</span>
                        <strong>
                          -₹
                          {Number(
                            order.discountAmount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    )}

                    <div className="admin-order-detail">
                      <span>Delivery</span>
                      <strong>
                        {Number(
                          order.deliveryCharge || 0
                        ) > 0
                          ? `₹${Number(
                              order.deliveryCharge
                            ).toLocaleString(
                              "en-IN"
                            )}`
                          : "To be decided"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Final Total</span>
                      <strong>
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  {order.address && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "14px",
                        background: "var(--cream)",
                        borderRadius: "10px",
                      }}
                    >
                      <strong>Address</strong>
                      <p>{order.address}</p>
                    </div>
                  )}

                  {order.items?.length > 0 && (
                    <div
                      style={{
                        marginTop: "16px",
                      }}
                    >
                      <strong>Products</strong>

                      {order.items.map(
                        (item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              padding:
                                "8px 0",
                              borderBottom:
                                "1px solid var(--line)",
                            }}
                          >
                            <span>
                              {item.productName ||
                                "Product"}{" "}
                              × {item.quantity}
                            </span>

                            <strong>
                              ₹
                              {Number(
                                item.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="admin-toolbar">
                    <select
                      className="admin-select"
                      value={
                        order.orderStatus ||
                        "Pending"
                      }
                      onChange={(e) =>
                        updateOrderStatus(
                          order._id,
                          e.target.value
                        )
                      }
                    >
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>Processing</option>
                      <option>Ready</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>

                    <button
                      className="admin-btn secondary"
                      onClick={() =>
                        updateDeliveryCharge(
                          order._id
                        )
                      }
                    >
                      Set Delivery Charge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     CUSTOMERS
  ===================================================== */

  const renderCustomers = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Customers</h1>
            <p>
              View customers registered on Cozy Noor.
            </p>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Registered Customers</h2>
              <p>
                {customers.length} customer
                {customers.length !== 1
                  ? "s"
                  : ""}{" "}
                registered.
              </p>
            </div>
          </div>

          {customers.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">♡</div>
              <h3>No customers yet</h3>
              <p>
                Customers who register will appear
                here.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {customers.map((customer) => (
                <div
                  className="admin-order-card"
                  key={customer._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        {customer.name}
                      </div>

                      <div className="admin-order-date">
                        Joined{" "}
                        {customer.createdAt
                          ? new Date(
                              customer.createdAt
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : ""}
                      </div>
                    </div>

                    <span className="admin-status">
                      Customer
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Name</span>
                      <strong>
                        {customer.name}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Email</span>
                      <strong>
                        {customer.email}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Phone</span>
                      <strong>
                        {customer.phone ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const renderCategories = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Categories</h1>
            <p>
              Manage categories for your products.
            </p>
          </div>

          <button
            className="admin-btn"
            onClick={() => {
              if (showAddCategory) {
                setCategoryForm({
                  name: "",
                  description: "",
                  image: "",
                });
                setEditingCategoryId(null);
                setShowAddCategory(false);
              } else {
                setCategoryForm({
                  name: "",
                  description: "",
                  image: "",
                });
                setEditingCategoryId(null);
                setShowAddCategory(true);
              }
            }}
          >
            {showAddCategory
              ? "Close"
              : "+ Add Category"}
          </button>
        </div>

        {showAddCategory && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>{editingCategoryId ? "Edit Category" : "Add New Category"}</h2>
                <p>
                  Create a category without changing
                  website code.
                </p>
              </div>
            </div>

            <form
              className="admin-form"
              onSubmit={
                editingCategoryId
                  ? handleUpdateCategory
                  : handleAddCategory
              }
            >
              <div className="admin-form-group">
                <label>Category Name</label>

                <input
                  name="name"
                  value={categoryForm.name}
                  onChange={
                    handleCategoryChange
                  }
                  placeholder="e.g. Flowers & Bouquets"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Category Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCategoryImageUpload}
                />

                <input
                  name="image"
                  value={categoryForm.image}
                  onChange={handleCategoryChange}
                  placeholder="Or paste image URL"
                  style={{ marginTop: "8px" }}
                />

                {categoryForm.image && (
                  <div style={{ marginTop: "10px" }}>
                    <img
                      src={categoryForm.image}
                      alt="Category preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="admin-form-group full">
                <label>Description</label>

                <textarea
                  name="description"
                  value={
                    categoryForm.description
                  }
                  onChange={
                    handleCategoryChange
                  }
                  placeholder="Write category description..."
                />
              </div>

              <div className="admin-form-submit">
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingCategoryId
                    ? "Update Category"
                    : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>All Categories</h2>
              <p>
                {categories.length} categor
                {categories.length !== 1
                  ? "ies"
                  : "y"}{" "}
                available.
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">✿</div>
              <h3>No categories yet</h3>
              <p>
                Add your first category above.
              </p>
            </div>
          ) : (
            <div className="admin-product-grid">
              {categories.map((category) => (
                <div
                  className="admin-product-card"
                  key={category._id}
                >
                  <div className="admin-product-image">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                      />
                    ) : (
                      <span>✿</span>
                    )}
                  </div>

                  <div className="admin-product-info">
                    <h3>{category.name}</h3>

                    <p>
                      {category.description ||
                        "No description added."}
                    </p>

                    <p>
                      Status:{" "}
                      {category.active !== false
                        ? "Active"
                        : "Inactive"}
                    </p>

                    <div className="admin-product-actions">
                      <button
                        onClick={() =>
                          handleEditCategory(category)
                        }
                        className="admin-btn"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteCategory(category._id)
                        }
                        className="admin-btn danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     MESSAGES
  ===================================================== */

  const renderMessages = () => {
    const unreadMessages = messages.filter(
      (message) => !message.read
    ).length;

    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Messages</h1>
            <p>
              Messages received from the Cozy Noor
              website.
            </p>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Messages</span>
            <strong>{messages.length}</strong>
            <small>All customer messages</small>
          </div>

          <div className="admin-stat-card">
            <span>Unread</span>
            <strong>{unreadMessages}</strong>
            <small>Need attention</small>
          </div>

          <div className="admin-stat-card">
            <span>Read</span>
            <strong>
              {messages.length - unreadMessages}
            </strong>
            <small>Already reviewed</small>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Customer Messages</h2>
              <p>
                Messages submitted through Contact.
              </p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">✉</div>
              <h3>No messages yet</h3>
              <p>
                Messages from your website will
                appear here.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {messages.map((message) => (
                <div
                  className="admin-order-card"
                  key={message._id}
                  style={{
                    borderLeft: message.read
                      ? "3px solid transparent"
                      : "3px solid var(--rose)",
                  }}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        {message.subject ||
                          "Customer Message"}
                      </div>

                      <div className="admin-order-date">
                        {message.createdAt
                          ? new Date(
                              message.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )
                          : ""}
                      </div>
                    </div>

                    <span className="admin-status">
                      {message.read
                        ? "Read"
                        : "Unread"}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Name</span>
                      <strong>
                        {message.name}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Email</span>
                      <strong>
                        {message.email}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Phone</span>
                      <strong>
                        {message.phone ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      background: "var(--cream)",
                      borderRadius: "10px",
                      lineHeight: "1.7",
                    }}
                  >
                    {message.message}
                  </div>

                  <div className="admin-toolbar">
                    <button
                      className="admin-btn secondary"
                      onClick={() =>
                        toggleMessageRead(
                          message
                        )
                      }
                    >
                      {message.read
                        ? "Mark Unread"
                        : "Mark Read"}
                    </button>

                    <button
                      className="admin-btn danger"
                      onClick={() =>
                        deleteMessage(
                          message._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     CUSTOM ORDERS
  ===================================================== */

  const renderCustomOrders = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Custom Orders</h1>
            <p>
              Manage custom crochet requests received
              from your website.
            </p>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Requests</span>
            <strong>{customOrders.length}</strong>
            <small>All custom requests</small>
          </div>

          <div className="admin-stat-card">
            <span>Pending</span>
            <strong>
              {
                customOrders.filter(
                  (item) =>
                    item.status === "Pending" ||
                    item.status === "New"
                ).length
              }
            </strong>
            <small>Need attention</small>
          </div>

          <div className="admin-stat-card">
            <span>Completed</span>
            <strong>
              {
                customOrders.filter(
                  (item) =>
                    item.status === "Completed"
                ).length
              }
            </strong>
            <small>Completed requests</small>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Customer Custom Requests</h2>
              <p>
                Every request submitted through Custom
                Order will appear here.
              </p>
            </div>
          </div>

          {customOrders.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">🧶</div>
              <h3>No custom orders yet</h3>
              <p>
                Custom requests from your website will
                appear here.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {customOrders.map((order) => (
                <div
                  className="admin-order-card"
                  key={order._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        {order.productIdea ||
                          order.productName ||
                          "Custom Crochet Request"}
                      </div>

                      <div className="admin-order-date">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )
                          : ""}
                      </div>
                    </div>

                    <span className="admin-status">
                      {order.status ||
                        "Pending"}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Name</span>
                      <strong>
                        {order.name ||
                          order.customerName ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Email</span>
                      <strong>
                        {order.email ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Phone</span>
                      <strong>
                        {order.phone ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Quantity</span>
                      <strong>
                        {order.quantity || 1}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Size</span>
                      <strong>
                        {order.size ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Colour</span>
                      <strong>
                        {order.colours ||
                          order.color ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Occasion</span>
                      <strong>
                        {order.occasion ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Budget</span>
                      <strong>
                        {order.budget
                          ? `₹${order.budget}`
                          : "Not specified"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Required By</span>
                      <strong>
                        {order.requiredBy ||
                          order.requiredByDate ||
                          "Not specified"}
                      </strong>
                    </div>
                  </div>

                  {order.designDetails && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "15px",
                        background: "var(--cream)",
                        borderRadius: "10px",
                      }}
                    >
                      <strong>
                        Design Details
                      </strong>
                      <p>
                        {order.designDetails}
                      </p>
                    </div>
                  )}

                  {order.notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "15px",
                        background: "var(--cream)",
                        borderRadius: "10px",
                      }}
                    >
                      <strong>Notes</strong>
                      <p>{order.notes}</p>
                    </div>
                  )}

                  {order.referenceImage && (
                    <div
                      style={{
                        marginTop: "16px",
                      }}
                    >
                      <strong>
                        Reference Image
                      </strong>

                      <div
                        style={{
                          marginTop: "10px",
                        }}
                      >
                        <img
                          src={
                            order.referenceImage
                          }
                          alt="Custom reference"
                          style={{
                            maxWidth: "220px",
                            width: "100%",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="admin-toolbar">
                    <select
                      className="admin-select"
                      value={
                        order.status ||
                        "Pending"
                      }
                      onChange={(e) =>
                        updateCustomOrderStatus(
                          order._id,
                          e.target.value
                        )
                      }
                    >
                      <option>Pending</option>
                      <option>Confirmed</option>
                      <option>Processing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>

                    <button
                      className="admin-btn danger"
                      onClick={() =>
                        deleteCustomOrder(
                          order._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     REVIEWS
  ===================================================== */

  const renderReviews = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Reviews</h1>
            <p>
              View and manage customer reviews.
            </p>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Reviews</span>
            <strong>{reviews.length}</strong>
            <small>Customer reviews</small>
          </div>

          <div className="admin-stat-card">
            <span>5 Star</span>
            <strong>
              {
                reviews.filter(
                  (review) =>
                    Number(
                      review.rating
                    ) === 5
                ).length
              }
            </strong>
            <small>Excellent reviews</small>
          </div>

          <div className="admin-stat-card">
            <span>Average Rating</span>
            <strong>
              {reviews.length
                ? (
                    reviews.reduce(
                      (sum, review) =>
                        sum +
                        Number(
                          review.rating || 0
                        ),
                      0
                    ) /
                    reviews.length
                  ).toFixed(1)
                : "0.0"}
            </strong>
            <small>Out of 5</small>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Customer Reviews</h2>
              <p>
                Reviews submitted through your website.
              </p>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">☆</div>
              <h3>No reviews yet</h3>
              <p>
                Customer reviews will appear here.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {reviews.map((review) => (
                <div
                  className="admin-order-card"
                  key={review._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        {review.name ||
                          review.customerName ||
                          "Customer"}
                      </div>

                      <div className="admin-order-date">
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )
                          : ""}
                      </div>
                    </div>

                    <span className="admin-status">
                      {Number(
                        review.rating || 0
                      )}{" "}
                      ★
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Product</span>
                      <strong>
                        {review.productName ||
                          review.product?.name ||
                          "General Review"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Email</span>
                      <strong>
                        {review.email ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Rating</span>
                      <strong>
                        {Number(
                          review.rating || 0
                        )} / 5
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      padding: "16px",
                      background: "var(--cream)",
                      borderRadius: "10px",
                      lineHeight: "1.7",
                    }}
                  >
                    {review.comment ||
                      review.review ||
                      review.message ||
                      "No review text."}
                  </div>
<button
  className="admin-btn"
  onClick={() =>
    toggleReviewApproval(
      review._id,
      review.approved
    )
  }
>
  {review.approved ? "Hide Review" : "Approve Review"}
</button>
                  <div className="admin-toolbar">
                    <button
                      className="admin-btn danger"
                      onClick={() =>
                        deleteReview(
                          review._id
                        )
                      }
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     OFFERS
  ===================================================== */

  const renderOffers = () => {
    const activeOffers = offers.filter(
      (offer) => offer.active
    );

    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Offers</h1>
            <p>
              Create and manage discounts for your
              Cozy Noor store.
            </p>
          </div>

          <button
            className="admin-btn"
            onClick={() => {
              if (showOfferForm) {
                resetOfferForm();
                setShowOfferForm(false);
              } else {
                resetOfferForm();
                setShowOfferForm(true);
              }
            }}
          >
            {showOfferForm
              ? "Close"
              : "+ Create Offer"}
          </button>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Offers</span>
            <strong>{offers.length}</strong>
            <small>All offers</small>
          </div>

          <div className="admin-stat-card">
            <span>Active Offers</span>
            <strong>{activeOffers.length}</strong>
            <small>Currently active</small>
          </div>

          <div className="admin-stat-card">
            <span>Inactive Offers</span>
            <strong>
              {offers.length -
                activeOffers.length}
            </strong>
            <small>Disabled offers</small>
          </div>
        </div>

        {showOfferForm && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>
                  {editingOffer
                    ? "Edit Offer"
                    : "Create New Offer"}
                </h2>

                <p>
                  Set discount rules customers can
                  use at checkout.
                </p>
              </div>
            </div>

            <form
              className="admin-form"
              onSubmit={handleOfferSubmit}
            >
              <div className="admin-form-group">
                <label>Offer Name</label>

                <input
                  value={offerForm.name}
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="e.g. Festive Sale"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Offer Code</label>

                <input
                  value={offerForm.code}
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      code: e.target.value
                        .toUpperCase(),
                    }))
                  }
                  placeholder="e.g. FESTIVE20"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Discount Type</label>

                <select
                  className="admin-select"
                  value={
                    offerForm.discountType
                  }
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      discountType:
                        e.target.value,
                    }))
                  }
                >
                  <option value="percentage">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed Amount
                  </option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Discount Value</label>

                <input
                  type="number"
                  min="0"
                  value={
                    offerForm.discountValue
                  }
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      discountValue:
                        e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Applies To</label>

                <select
                  className="admin-select"
                  value={
                    offerForm.applicability
                  }
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      applicability:
                        e.target.value,
                      productIds: [],
                      categories: [],
                    }))
                  }
                >
                  <option value="all">
                    All Products
                  </option>

                  <option value="product">
                    Selected Products
                  </option>

                  <option value="category">
                    Selected Categories
                  </option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Minimum Order Amount</label>

                <input
                  type="number"
                  min="0"
                  value={
                    offerForm.minimumOrderAmount
                  }
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      minimumOrderAmount:
                        e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="admin-form-group">
                <label>Maximum Discount</label>

                <input
                  type="number"
                  min="0"
                  value={
                    offerForm.maximumDiscount
                  }
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      maximumDiscount:
                        e.target.value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="admin-form-group">
                <label>Start Date</label>

                <input
                  type="datetime-local"
                  value={offerForm.startDate}
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      startDate:
                        e.target.value,
                    }))
                  }
                />
              </div>

              <div className="admin-form-group">
                <label>End Date</label>

                <input
                  type="datetime-local"
                  value={offerForm.endDate}
                  onChange={(e) =>
                    setOfferForm((prev) => ({
                      ...prev,
                      endDate:
                        e.target.value,
                    }))
                  }
                />
              </div>

              {offerForm.applicability ===
                "product" && (
                <div className="admin-form-group full">
                  <label>
                    Select Products
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    {products.map((product) => (
                      <label
                        key={product._id}
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={offerForm.productIds.includes(
                            product._id
                          )}
                          onChange={() =>
                            toggleOfferProduct(
                              product._id
                            )
                          }
                        />

                        {product.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {offerForm.applicability ===
                "category" && (
                <div className="admin-form-group full">
                  <label>
                    Select Categories
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    {categories.map(
                      (category) => (
                        <label
                          key={category._id}
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={offerForm.categories.includes(
                              category.name
                            )}
                            onChange={() =>
                              toggleOfferCategory(
                                category.name
                              )
                            }
                          />

                          {category.name}
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="admin-form-group full">
                <label>
                  <input
                    type="checkbox"
                    checked={offerForm.active}
                    onChange={(e) =>
                      setOfferForm((prev) => ({
                        ...prev,
                        active:
                          e.target.checked,
                      }))
                    }
                  />{" "}
                  Offer Active
                </label>
              </div>

              <div className="admin-form-submit">
                <button
                  type="submit"
                  className="admin-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingOffer
                    ? "Update Offer"
                    : "Create Offer"}
                </button>

                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => {
                    resetOfferForm();
                    setShowOfferForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>All Offers</h2>
              <p>
                Manage your discount codes and
                promotions.
              </p>
            </div>
          </div>

          {offers.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">♡</div>
              <h3>No offers yet</h3>
              <p>
                Create your first discount offer
                above.
              </p>
            </div>
          ) : (
            <div className="admin-orders">
              {offers.map((offer) => (
                <div
                  className="admin-order-card"
                  key={offer._id}
                >
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        {offer.name}
                      </div>

                      <div className="admin-order-date">
                        Code:{" "}
                        <strong>
                          {offer.code}
                        </strong>
                      </div>
                    </div>

                    <span className="admin-status">
                      {offer.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div className="admin-order-detail">
                      <span>Discount</span>
                      <strong>
                        {offer.discountType ===
                        "percentage"
                          ? `${offer.discountValue}% OFF`
                          : `₹${Number(
                              offer.discountValue
                            ).toLocaleString(
                              "en-IN"
                            )} OFF`}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Applies To</span>
                      <strong>
                        {offer.applicability ===
                        "all"
                          ? "All Products"
                          : offer.applicability ===
                            "product"
                          ? "Selected Products"
                          : "Selected Categories"}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Minimum Order</span>
                      <strong>
                        ₹
                        {Number(
                          offer.minimumOrderAmount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div className="admin-order-detail">
                      <span>Maximum Discount</span>
                      <strong>
                        {offer.maximumDiscount
                          ? `₹${Number(
                              offer.maximumDiscount
                            ).toLocaleString(
                              "en-IN"
                            )}`
                          : "No limit"}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-toolbar">
                    <button
                      className="admin-btn"
                      onClick={() =>
                        handleEditOffer(
                          offer
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="admin-btn danger"
                      onClick={() =>
                        deleteOffer(
                          offer._id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  /* =====================================================
     SETTINGS
  ===================================================== */

  const renderSettings = () => {
    return (
      <>
        <div className="admin-topbar">
          <div className="admin-heading">
            <h1>Settings</h1>
            <p>
              Manage basic Cozy Noor store settings.
            </p>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Store Settings</h2>
              <p>
                These settings are currently stored
                locally and can later be connected
                to the backend.
              </p>
            </div>
          </div>

          <div className="admin-form">
            <div className="admin-form-group">
              <label>Store Name</label>

              <input
                name="storeName"
                value={settings.storeName}
                onChange={handleSettingsChange}
              />
            </div>

            <div className="admin-form-group">
              <label>Making / Delivery Time</label>

              <input
                name="deliveryTime"
                value={settings.deliveryTime}
                onChange={handleSettingsChange}
              />
            </div>

            <div className="admin-form-group">
              <label>Instagram</label>

              <input
                name="instagram"
                value={settings.instagram}
                onChange={handleSettingsChange}
              />
            </div>

            <div className="admin-form-group full">
              <label>
                <input
                  type="checkbox"
                  name="codEnabled"
                  checked={settings.codEnabled}
                  onChange={
                    handleSettingsChange
                  }
                />{" "}
                Cash on Delivery Enabled
              </label>
            </div>

            <div className="admin-form-group full">
              <label>
                <input
                  type="checkbox"
                  name="onlinePaymentEnabled"
                  checked={
                    settings.onlinePaymentEnabled
                  }
                  onChange={
                    handleSettingsChange
                  }
                />{" "}
                Online Payment Enabled
              </label>
            </div>

            <div className="admin-form-group full">
              <label>
                <input
                  type="checkbox"
                  name="customOrdersEnabled"
                  checked={
                    settings.customOrdersEnabled
                  }
                  onChange={
                    handleSettingsChange
                  }
                />{" "}
                Custom Orders Enabled
              </label>
            </div>

            <div className="admin-form-submit">
              <button
                className="admin-btn"
                type="button"
                onClick={saveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Store Information</h2>
              <p>
                Current Cozy Noor configuration.
              </p>
            </div>
          </div>

          <div className="admin-order-details">
            <div className="admin-order-detail">
              <span>Store</span>
              <strong>
                {settings.storeName}
              </strong>
            </div>

            <div className="admin-order-detail">
              <span>Making / Delivery</span>
              <strong>
                {settings.deliveryTime}
              </strong>
            </div>

            <div className="admin-order-detail">
              <span>COD</span>
              <strong>
                {settings.codEnabled
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="admin-order-detail">
              <span>Online Payment</span>
              <strong>
                {settings.onlinePaymentEnabled
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="admin-order-detail">
              <span>Custom Orders</span>
              <strong>
                {settings.customOrdersEnabled
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

            <div className="admin-order-detail">
              <span>Instagram</span>
              <strong>
                {settings.instagram}
              </strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  /* =====================================================
     CONTENT
  ===================================================== */

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();

      case "products":
        return renderProducts();

      case "orders":
        return renderOrders();

      case "customers":
        return renderCustomers();

      case "categories":
        return renderCategories();

      case "custom-orders":
        return renderCustomOrders();

      case "reviews":
        return renderReviews();

      case "messages":
        return renderMessages();

      case "offers":
        return renderOffers();

      case "settings":
        return renderSettings();

      default:
        return renderDashboard();
    }
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="admin-page">
      <div className="admin-layout">

        <aside className="admin-sidebar">

          <div className="admin-logo">
            <h2>Cozy Noor</h2>
            <p>Admin Panel</p>
          </div>

          <nav className="admin-nav">

            <button
              className={
                activeSection === "dashboard"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("dashboard")
              }
            >
              Dashboard
            </button>

            <button
              className={
                activeSection === "products"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("products")
              }
            >
              Products
            </button>

            <button
              className={
                activeSection === "orders"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("orders")
              }
            >
              Orders
              {orders.filter(
                (order) =>
                  order.orderStatus ===
                    "Pending" ||
                  order.orderStatus ===
                    "Confirmed"
              ).length > 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                  }}
                >
                  (
                  {
                    orders.filter(
                      (order) =>
                        order.orderStatus ===
                          "Pending" ||
                        order.orderStatus ===
                          "Confirmed"
                    ).length
                  }
                  )
                </span>
              )}
            </button>

            <button
              className={
                activeSection === "customers"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("customers")
              }
            >
              Customers
            </button>

            <button
              className={
                activeSection === "categories"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("categories")
              }
            >
              Categories
            </button>

            <button
              className={
                activeSection ===
                "custom-orders"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection(
                  "custom-orders"
                )
              }
            >
              Custom Orders

              {customOrders.filter(
                (order) =>
                  order.status === "Pending" ||
                  order.status === "New"
              ).length > 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                  }}
                >
                  (
                  {
                    customOrders.filter(
                      (order) =>
                        order.status ===
                          "Pending" ||
                        order.status === "New"
                    ).length
                  }
                  )
                </span>
              )}
            </button>

            <button
              className={
                activeSection === "reviews"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("reviews")
              }
            >
              Reviews
            </button>

            <button
              className={
                activeSection === "messages"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("messages")
              }
            >
              Messages

              {messages.filter(
                (message) => !message.read
              ).length > 0 && (
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "11px",
                  }}
                >
                  (
                  {
                    messages.filter(
                      (message) =>
                        !message.read
                    ).length
                  }
                  )
                </span>
              )}
            </button>

            <button
              className={
                activeSection === "offers"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("offers")
              }
            >
              Offers
            </button>

            <button
              className={
                activeSection === "settings"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("settings")
              }
            >
              Settings
            </button>

            <button
              className="admin-logout"
              onClick={handleLogout}
            >
              Logout
            </button>

          </nav>
        </aside>

        <main className="admin-main">
          {renderContent()}
        </main>

      </div>
    </div>
  );
}

export default Admin;

