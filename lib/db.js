'use client';

import companiesData from './data/companies.json';
import categoriesData from './data/categories.json';
import productsData from './data/products.json';
import requestsData from './data/requests.json';

// Local Storage Keys
const COMPANIES_KEY = 'companies';
const CATEGORIES_KEY = 'categories';
const PRODUCTS_KEY = 'products';
const REQUESTS_KEY = 'requests';
const CART_KEY = 'cart';

// Initialize data
function initializeData() {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(COMPANIES_KEY)) {
      localStorage.setItem(COMPANIES_KEY, JSON.stringify(companiesData));
    }
    if (!localStorage.getItem(CATEGORIES_KEY)) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categoriesData));
    }
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(productsData));
    }
    if (!localStorage.getItem(REQUESTS_KEY)) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(requestsData));
    }
    if (!localStorage.getItem(CART_KEY)) {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
    }
  }
}

// Helper functions
function getData(key) {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

function setData(key, data) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

// Company operations
export async function addCompany(company) {
  const data = getData(COMPANIES_KEY) || { lastId: 0, items: [] };
  const newId = data.lastId + 1;
  const newCompany = { ...company, id: newId };
  
  data.lastId = newId;
  data.items.push(newCompany);
  setData(COMPANIES_KEY, data);
  
  return newCompany;
}

export async function getCompanies() {
  const data = getData(COMPANIES_KEY);
  return data?.items || [];
}

// Category operations
export async function addCategory(category) {
  const data = getData(CATEGORIES_KEY) || { lastId: 0, items: [] };
  const newId = data.lastId + 1;
  const newCategory = { ...category, id: newId };
  
  data.lastId = newId;
  data.items.push(newCategory);
  setData(CATEGORIES_KEY, data);
  
  return newCategory;
}

export async function getCategories() {
  const data = getData(CATEGORIES_KEY);
  return data?.items || [];
}

// Product operations
export async function addProduct(product) {
  const data = getData(PRODUCTS_KEY) || { lastId: 0, items: [] };
  const newId = data.lastId + 1;
  const newProduct = { ...product, id: newId };
  
  data.lastId = newId;
  data.items.push(newProduct);
  setData(PRODUCTS_KEY, data);
  
  return newProduct;
}

export async function getProducts() {
  const data = getData(PRODUCTS_KEY);
  const products = data?.items || [];
  const categories = await getCategories();
  const companies = await getCompanies();

  return products.map(product => ({
    ...product,
    categoryName: categories.find(c => c.id === parseInt(product.categoryId))?.name,
    companyName: companies.find(c => c.id === parseInt(product.companyId))?.name
  }));
}

// Cart operations
export async function addToCart(item) {
  const cartItems = getData(CART_KEY) || [];
  cartItems.push(item);
  setData(CART_KEY, cartItems);
  return item;
}

export async function getCart() {
  return getData(CART_KEY) || [];
}

export async function clearCart() {
  setData(CART_KEY, []);
}

// Request operations
export async function addRequest(request) {
  const data = getData(REQUESTS_KEY) || { lastId: 0, items: [] };
  const newId = data.lastId + 1;
  const newRequest = { ...request, id: newId };
  
  data.lastId = newId;
  data.items.push(newRequest);
  setData(REQUESTS_KEY, data);
  
  return newId;
}

export async function getRequests() {
  const data = getData(REQUESTS_KEY);
  return (data?.items || []).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Helper functions
export function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Initialize database
export function initializeDatabase() {
  if (typeof window !== 'undefined') {
    initializeData();
  }
}