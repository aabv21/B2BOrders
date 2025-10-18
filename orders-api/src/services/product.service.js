import { ProductModel } from '../models/product.model.js';
import { OrderError, ErrorTypes } from '../utils/errors.js';

export class ProductService {
  /**
   * @description Create a new product
   * @param {string} [data.sku] - Product SKU (auto-generated if not provided)
   * @param {string} data.name - Product name
   * @param {number} data.price_cents - Price in cents
   * @param {number} [data.stock=0] - Initial stock
   * @returns {Promise<Object>} Created product object
   */
  static async createProduct({ sku, name, price_cents, stock = 0 }) {
    // Generate SKU if not provided
    if (!sku) {
      sku = await this._generateUniqueSku(name);
    } else {
      // Check if manually provided SKU already exists
      const existingProduct = await ProductModel.findBySku(sku);
      if (existingProduct) {
        throw new OrderError(
          ErrorTypes.PRODUCT_ALREADY_EXISTS.message,
          ErrorTypes.PRODUCT_ALREADY_EXISTS.statusCode,
          `SKU ${sku} already exists`
        );
      }
    }

    const productId = await ProductModel.create({
      sku,
      name,
      price_cents,
      stock,
    });
    const product = await ProductModel.findById(productId);
    return product;
  }

  /**
   * @description Generate a unique SKU based on product name
   * @param {string} name - Product name
   * @returns {Promise<string>} Unique SKU
   * @private
   */
  static async _generateUniqueSku(name) {
    // Create base SKU from name (first 3 words, uppercase, max 20 chars)
    const baseSku = name
      .split(' ')
      .slice(0, 3)
      .join('-')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .substring(0, 20);

    // Try to find a unique SKU
    let sku = baseSku;
    let counter = 1;

    while (await ProductModel.findBySku(sku)) {
      sku = `${baseSku}-${counter}`;
      counter++;
    }

    return sku;
  }

  /**
   * @description Get product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  static async getProductById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new OrderError(
        ErrorTypes.PRODUCT_NOT_FOUND.message,
        ErrorTypes.PRODUCT_NOT_FOUND.statusCode,
        `Product with ID ${id} not found`
      );
    }
    return product;
  }

  /**
   * @description Search products with pagination
   * @param {string} [params.search=''] - Search term
   * @param {number} [params.cursor=0] - Pagination cursor (last ID)
   * @param {number} [params.limit=10] - Results limit
   * @returns {Promise<Object>} Object with data array and pagination info
   */
  static async searchProducts({ search = '', cursor = 0, limit = 10 }) {
    const cursorNum = parseInt(cursor, 10);
    const limitNum = parseInt(limit, 10);

    const products = await ProductModel.search({
      search,
      cursor: cursorNum,
      limit: limitNum,
    });

    const nextCursor =
      products.length > 0 ? products[products.length - 1].id : null;
    const hasMore = products.length === limitNum;

    return {
      data: products,
      pagination: {
        nextCursor: hasMore ? nextCursor : null,
        hasMore,
        limit: limitNum,
      },
    };
  }

  /**
   * @description Update product
   * @param {string|number} id - Product ID
   * @param {number} [updateData.price_cents] - Price in cents
   * @param {number} [updateData.stock] - Stock quantity
   * @returns {Promise<Object>} Updated product object
   */
  static async updateProduct(id, updateData) {
    // Check if product exists
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new OrderError(
        ErrorTypes.PRODUCT_NOT_FOUND.message,
        ErrorTypes.PRODUCT_NOT_FOUND.statusCode,
        `Product with ID ${id} not found`
      );
    }

    const updated = await ProductModel.update(id, updateData);
    if (!updated) {
      throw new OrderError(
        ErrorTypes.VALIDATION_ERROR.message,
        ErrorTypes.VALIDATION_ERROR.statusCode,
        'No changes were made'
      );
    }

    const updatedProduct = await ProductModel.findById(id);
    return updatedProduct;
  }

  /**
   * @description Delete product
   * @param {string|number} id - Product ID
   * @returns {Promise<void>}
   */
  static async deleteProduct(id) {
    // Check if product exists
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new OrderError(
        ErrorTypes.PRODUCT_NOT_FOUND.message,
        ErrorTypes.PRODUCT_NOT_FOUND.statusCode,
        `Product with ID ${id} not found`
      );
    }

    await ProductModel.delete(id);
  }
}
