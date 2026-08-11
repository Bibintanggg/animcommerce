import api from "@/lib/api";
import {
  DeleteProductResponse,
  Product,
  StockMovementChart,
  getProductsResponse,
} from "@/types/product";
import { ProductCategory } from "@/enums/product-category";
import { ProductStatus } from "@/enums/product-status";

interface ProductResponse {
  data: Product[];
  message: string;
}

interface SingleProductResponse {
  data: Product;
  message: string;
}

export const getProducts = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
): Promise<getProductsResponse> => {
  const response = await api.get<{
    data: Product[];
    total: number;
  }>("/products", {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
    },
  });

  const total = response.data.total;

  return {
    data: response.data.data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getNewArrivals = async () => {
  const response = await api.get<ProductResponse>("/products");
  return response.data.data
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 8)
    .filter((product) => product.is_active === ProductStatus.ProductPublished);
};

export const getCategoriesItem = async (category: ProductCategory) => {
  const response = await api.get<ProductResponse>("/products");
  return response.data.data.filter((product) => product.category === category);
};

export const getProductDetails = async (slug: string) => {
  const response = await api.get<SingleProductResponse>(`/product-details/${slug}`);
  return response.data.data;
};

export const createProduct = async (url: string, formData: FormData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan produk");
  }

  return result.data as Product;
};

export const updateProduct = async (url: string, formData: FormData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui produk");
  }

  return result.data as Product;
};

export const deleteProducts = async (userId: number) => {
  const response = await api.delete<DeleteProductResponse>(
    `/admin/products/${userId}`,
  );
  return response.data.message;
};

export const getFeaturedProducts = async () => {
  const response = await api.get<ProductResponse>("/products");
  return response.data.data
    .filter((product) => product.is_active === ProductStatus.ProductPublished)
    .slice(0, 7);
};

export const getAllProducts = async () => {
  const response = await api.get<ProductResponse>("/products", {
    params: {
      limit: 100,
    }
  });
  return response.data.data;
}

export const getHeroBanner = async () => {
  const response = await api.get<ProductResponse>("/products")
  return response.data.data
    .sort((a, b) => new Date(b.is_active).getTime() - new Date(a.is_active).getTime())
    .filter((product) => product.is_active === ProductStatus.ProductPublished)
}


// ADMIN
export const getStockMovements = async (): Promise<StockMovementChart[]> => {
  const response = await api.get<{message: string, data: StockMovementChart[]}>("/admin/products/stock-movements");
  return response.data.data;
};