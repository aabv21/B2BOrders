import { ProductService } from '../services/product.service.js';
import { OrderError, ErrorTypes } from '../utils/errors.js';

export class ProductController {
  /**
   * @description Create a new product
   * @param {Object} req - Express request object
   * @param {Object} req.validatedBody - Validated request body
   * @param {string} [req.validatedBody.sku] - Product SKU (auto-generated if not provided)
   * @param {string} req.validatedBody.name - Product name
   * @param {number} req.validatedBody.price_cents - Price in cents
   * @param {number} [req.validatedBody.stock] - Initial stock
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Created product data or error response
   */
  static async create(req, res) {
    try {
      const { sku, name, price_cents, stock } = req.validatedBody;
      const product = await ProductService.createProduct({ sku, name, price_cents, stock });
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error creating product:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Get product by ID
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Product ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Product data or error response
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      res.json(product);
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error fetching product:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Search products with pagination
   * @param {Object} req - Express request object
   * @param {Object} req.validatedQuery - Validated query parameters
   * @param {string} req.validatedQuery.search - Search term
   * @param {number} req.validatedQuery.cursor - Pagination cursor
   * @param {number} req.validatedQuery.limit - Results limit
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Paginated product list or error response
   */
  static async search(req, res) {
    try {
      const { search = '', cursor = 0, limit = 10 } = req.validatedQuery;
      const result = await ProductService.searchProducts({ search, cursor, limit });
      res.json(result);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Update product price and/or stock
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Product ID
   * @param {Object} req.validatedBody - Validated request body
   * @param {number} [req.validatedBody.price_cents] - Price in cents
   * @param {number} [req.validatedBody.stock] - Stock quantity
   * @param {Object} res - Express response object
   * @returns {Promise<void>} Updated product data or error response
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedBody;
      const updatedProduct = await ProductService.updateProduct(id, updateData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error updating product:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }

  /**
   * @description Delete product
   * @param {Object} req - Express request object
   * @param {Object} req.params - Request parameters
   * @param {string} req.params.id - Product ID
   * @param {Object} res - Express response object
   * @returns {Promise<void>} 204 No Content or error response
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
          error: error.message,
          ...(error.details && { details: error.details }),
        });
      }
      console.error('Error deleting product:', error);
      res.status(500).json({ error: ErrorTypes.INTERNAL_ERROR.message });
    }
  }
}
