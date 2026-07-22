import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { ActivityItem, AdminDashboardSummary, AdminGetOrdersParams, AdminGetProductsParams, AdminGetUsersParams, AdminGetWithdrawalsParams, AdminUserPage, AdminUserStatusUpdate, AuthResponse, Cart, CartItemInput, CartItemUpdate, Category, ChartPoint, Conversation, ConversationInput, Courier, DashboardSummary, Dispute, DisputeInput, DisputeResolution, ErrorResponse, EscrowAccount, GetMidtransConfig200, GetMidtransToken200, GetMidtransTokenBody, GetOrdersParams, GetProductsParams, GetReportsParams, GetSalesChartParams, GetShippingCities200Item, GetShippingCitiesParams, GetShippingProvinces200Item, HealthStatus, LoginInput, Message, MessageInput, Notification, Order, OrderInput, OrderStatusUpdate, Product, ProductInput, ProductModerationInput, ProductPage, ProductUpdate, RegisterInput, Report, ReportInput, ReportResolution, RequestUploadUrlBody, RequestUploadUrlResponse, Review, ReviewInput, ShippingCalculateInput, ShippingOption, SuccessResponse, TrackingInfo, Transaction, User, UserProfile, UserUpdate, Wallet, WithdrawalInput, WithdrawalProcess } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<ErrorResponse>;
/**
* @summary Register new user
*/
export declare const useRegister: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login with email/phone and password
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<ErrorResponse>;
/**
* @summary Login with email/phone and password
*/
export declare const useLogin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout current user
 */
export declare const logout: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout current user
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current authenticated user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<ErrorResponse>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserUrl: (userId: number) => string;
/**
 * @summary Get user profile by ID
 */
export declare const getUser: (userId: number, options?: RequestInit) => Promise<UserProfile>;
export declare const getGetUserQueryKey: (userId: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<ErrorResponse>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get user profile by ID
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<ErrorResponse>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserUrl: (userId: number) => string;
/**
 * @summary Update user profile
 */
export declare const updateUser: (userId: number, userUpdate: UserUpdate, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        userId: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    userId: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UserUpdate>;
export type UpdateUserMutationError = ErrorType<unknown>;
/**
* @summary Update user profile
*/
export declare const useUpdateUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        userId: number;
        data: BodyType<UserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    userId: number;
    data: BodyType<UserUpdate>;
}, TContext>;
export declare const getGetUserProductsUrl: (userId: number) => string;
/**
 * @summary List products by a specific seller
 */
export declare const getUserProducts: (userId: number, options?: RequestInit) => Promise<Product[]>;
export declare const getGetUserProductsQueryKey: (userId: number) => readonly [`/api/users/${number}/products`];
export declare const getGetUserProductsQueryOptions: <TData = Awaited<ReturnType<typeof getUserProducts>>, TError = ErrorType<unknown>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getUserProducts>>>;
export type GetUserProductsQueryError = ErrorType<unknown>;
/**
 * @summary List products by a specific seller
 */
export declare function useGetUserProducts<TData = Awaited<ReturnType<typeof getUserProducts>>, TError = ErrorType<unknown>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserReviewsUrl: (userId: number) => string;
/**
 * @summary Get reviews about a seller
 */
export declare const getUserReviews: (userId: number, options?: RequestInit) => Promise<Review[]>;
export declare const getGetUserReviewsQueryKey: (userId: number) => readonly [`/api/users/${number}/reviews`];
export declare const getGetUserReviewsQueryOptions: <TData = Awaited<ReturnType<typeof getUserReviews>>, TError = ErrorType<unknown>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserReviews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUserReviews>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserReviewsQueryResult = NonNullable<Awaited<ReturnType<typeof getUserReviews>>>;
export type GetUserReviewsQueryError = ErrorType<unknown>;
/**
 * @summary Get reviews about a seller
 */
export declare function useGetUserReviews<TData = Awaited<ReturnType<typeof getUserReviews>>, TError = ErrorType<unknown>>(userId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUserReviews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetCategoriesUrl: () => string;
/**
 * @summary List all product categories
 */
export declare const getCategories: (options?: RequestInit) => Promise<Category[]>;
export declare const getGetCategoriesQueryKey: () => readonly ["/api/categories"];
export declare const getGetCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof getCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof getCategories>>>;
export type GetCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary List all product categories
 */
export declare function useGetCategories<TData = Awaited<ReturnType<typeof getCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProductsUrl: (params?: GetProductsParams) => string;
/**
 * @summary List / search products
 */
export declare const getProducts: (params?: GetProductsParams, options?: RequestInit) => Promise<ProductPage>;
export declare const getGetProductsQueryKey: (params?: GetProductsParams) => readonly ["/api/products", ...GetProductsParams[]];
export declare const getGetProductsQueryOptions: <TData = Awaited<ReturnType<typeof getProducts>>, TError = ErrorType<unknown>>(params?: GetProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getProducts>>>;
export type GetProductsQueryError = ErrorType<unknown>;
/**
 * @summary List / search products
 */
export declare function useGetProducts<TData = Awaited<ReturnType<typeof getProducts>>, TError = ErrorType<unknown>>(params?: GetProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProductUrl: () => string;
/**
 * @summary Create a new product listing
 */
export declare const createProduct: (productInput: ProductInput, options?: RequestInit) => Promise<Product>;
export declare const getCreateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export type CreateProductMutationResult = NonNullable<Awaited<ReturnType<typeof createProduct>>>;
export type CreateProductMutationBody = BodyType<ProductInput>;
export type CreateProductMutationError = ErrorType<unknown>;
/**
* @summary Create a new product listing
*/
export declare const useCreateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProduct>>, TError, {
        data: BodyType<ProductInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProduct>>, TError, {
    data: BodyType<ProductInput>;
}, TContext>;
export declare const getGetFeaturedProductsUrl: () => string;
/**
 * @summary Get featured/promoted products
 */
export declare const getFeaturedProducts: (options?: RequestInit) => Promise<Product[]>;
export declare const getGetFeaturedProductsQueryKey: () => readonly ["/api/products/featured"];
export declare const getGetFeaturedProductsQueryOptions: <TData = Awaited<ReturnType<typeof getFeaturedProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetFeaturedProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getFeaturedProducts>>>;
export type GetFeaturedProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get featured/promoted products
 */
export declare function useGetFeaturedProducts<TData = Awaited<ReturnType<typeof getFeaturedProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getFeaturedProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetTrendingProductsUrl: () => string;
/**
 * @summary Get trending products (most viewed/purchased)
 */
export declare const getTrendingProducts: (options?: RequestInit) => Promise<Product[]>;
export declare const getGetTrendingProductsQueryKey: () => readonly ["/api/products/trending"];
export declare const getGetTrendingProductsQueryOptions: <TData = Awaited<ReturnType<typeof getTrendingProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrendingProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrendingProductsQueryResult = NonNullable<Awaited<ReturnType<typeof getTrendingProducts>>>;
export type GetTrendingProductsQueryError = ErrorType<unknown>;
/**
 * @summary Get trending products (most viewed/purchased)
 */
export declare function useGetTrendingProducts<TData = Awaited<ReturnType<typeof getTrendingProducts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetProductUrl: (productId: number) => string;
/**
 * @summary Get product detail
 */
export declare const getProduct: (productId: number, options?: RequestInit) => Promise<Product>;
export declare const getGetProductQueryKey: (productId: number) => readonly [`/api/products/${number}`];
export declare const getGetProductQueryOptions: <TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<ErrorResponse>>(productId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductQueryResult = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type GetProductQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get product detail
 */
export declare function useGetProduct<TData = Awaited<ReturnType<typeof getProduct>>, TError = ErrorType<ErrorResponse>>(productId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProduct>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateProductUrl: (productId: number) => string;
/**
 * @summary Update a product listing
 */
export declare const updateProduct: (productId: number, productUpdate: ProductUpdate, options?: RequestInit) => Promise<Product>;
export declare const getUpdateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        productId: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
    productId: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export type UpdateProductMutationResult = NonNullable<Awaited<ReturnType<typeof updateProduct>>>;
export type UpdateProductMutationBody = BodyType<ProductUpdate>;
export type UpdateProductMutationError = ErrorType<unknown>;
/**
* @summary Update a product listing
*/
export declare const useUpdateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateProduct>>, TError, {
        productId: number;
        data: BodyType<ProductUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateProduct>>, TError, {
    productId: number;
    data: BodyType<ProductUpdate>;
}, TContext>;
export declare const getDeleteProductUrl: (productId: number) => string;
/**
 * @summary Delete a product listing
 */
export declare const deleteProduct: (productId: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getDeleteProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        productId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    productId: number;
}, TContext>;
export type DeleteProductMutationResult = NonNullable<Awaited<ReturnType<typeof deleteProduct>>>;
export type DeleteProductMutationError = ErrorType<unknown>;
/**
* @summary Delete a product listing
*/
export declare const useDeleteProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteProduct>>, TError, {
        productId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteProduct>>, TError, {
    productId: number;
}, TContext>;
export declare const getGetProductReviewsUrl: (productId: number) => string;
/**
 * @summary Get reviews for a product
 */
export declare const getProductReviews: (productId: number, options?: RequestInit) => Promise<Review[]>;
export declare const getGetProductReviewsQueryKey: (productId: number) => readonly [`/api/products/${number}/reviews`];
export declare const getGetProductReviewsQueryOptions: <TData = Awaited<ReturnType<typeof getProductReviews>>, TError = ErrorType<unknown>>(productId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductReviews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getProductReviews>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetProductReviewsQueryResult = NonNullable<Awaited<ReturnType<typeof getProductReviews>>>;
export type GetProductReviewsQueryError = ErrorType<unknown>;
/**
 * @summary Get reviews for a product
 */
export declare function useGetProductReviews<TData = Awaited<ReturnType<typeof getProductReviews>>, TError = ErrorType<unknown>>(productId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getProductReviews>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateProductReviewUrl: (productId: number) => string;
/**
 * @summary Submit a review for a product
 */
export declare const createProductReview: (productId: number, reviewInput: ReviewInput, options?: RequestInit) => Promise<Review>;
export declare const getCreateProductReviewMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProductReview>>, TError, {
        productId: number;
        data: BodyType<ReviewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createProductReview>>, TError, {
    productId: number;
    data: BodyType<ReviewInput>;
}, TContext>;
export type CreateProductReviewMutationResult = NonNullable<Awaited<ReturnType<typeof createProductReview>>>;
export type CreateProductReviewMutationBody = BodyType<ReviewInput>;
export type CreateProductReviewMutationError = ErrorType<unknown>;
/**
* @summary Submit a review for a product
*/
export declare const useCreateProductReview: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createProductReview>>, TError, {
        productId: number;
        data: BodyType<ReviewInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createProductReview>>, TError, {
    productId: number;
    data: BodyType<ReviewInput>;
}, TContext>;
export declare const getGetCartUrl: () => string;
/**
 * @summary Get current user's cart
 */
export declare const getCart: (options?: RequestInit) => Promise<Cart>;
export declare const getGetCartQueryKey: () => readonly ["/api/cart"];
export declare const getGetCartQueryOptions: <TData = Awaited<ReturnType<typeof getCart>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCart>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCartQueryResult = NonNullable<Awaited<ReturnType<typeof getCart>>>;
export type GetCartQueryError = ErrorType<unknown>;
/**
 * @summary Get current user's cart
 */
export declare function useGetCart<TData = Awaited<ReturnType<typeof getCart>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAddToCartUrl: () => string;
/**
 * @summary Add item to cart
 */
export declare const addToCart: (cartItemInput: CartItemInput, options?: RequestInit) => Promise<Cart>;
export declare const getAddToCartMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addToCart>>, TError, {
        data: BodyType<CartItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addToCart>>, TError, {
    data: BodyType<CartItemInput>;
}, TContext>;
export type AddToCartMutationResult = NonNullable<Awaited<ReturnType<typeof addToCart>>>;
export type AddToCartMutationBody = BodyType<CartItemInput>;
export type AddToCartMutationError = ErrorType<unknown>;
/**
* @summary Add item to cart
*/
export declare const useAddToCart: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addToCart>>, TError, {
        data: BodyType<CartItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addToCart>>, TError, {
    data: BodyType<CartItemInput>;
}, TContext>;
export declare const getUpdateCartItemUrl: (itemId: number) => string;
/**
 * @summary Update cart item quantity
 */
export declare const updateCartItem: (itemId: number, cartItemUpdate: CartItemUpdate, options?: RequestInit) => Promise<Cart>;
export declare const getUpdateCartItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCartItem>>, TError, {
        itemId: number;
        data: BodyType<CartItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateCartItem>>, TError, {
    itemId: number;
    data: BodyType<CartItemUpdate>;
}, TContext>;
export type UpdateCartItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateCartItem>>>;
export type UpdateCartItemMutationBody = BodyType<CartItemUpdate>;
export type UpdateCartItemMutationError = ErrorType<unknown>;
/**
* @summary Update cart item quantity
*/
export declare const useUpdateCartItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateCartItem>>, TError, {
        itemId: number;
        data: BodyType<CartItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateCartItem>>, TError, {
    itemId: number;
    data: BodyType<CartItemUpdate>;
}, TContext>;
export declare const getRemoveCartItemUrl: (itemId: number) => string;
/**
 * @summary Remove item from cart
 */
export declare const removeCartItem: (itemId: number, options?: RequestInit) => Promise<Cart>;
export declare const getRemoveCartItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeCartItem>>, TError, {
        itemId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof removeCartItem>>, TError, {
    itemId: number;
}, TContext>;
export type RemoveCartItemMutationResult = NonNullable<Awaited<ReturnType<typeof removeCartItem>>>;
export type RemoveCartItemMutationError = ErrorType<unknown>;
/**
* @summary Remove item from cart
*/
export declare const useRemoveCartItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof removeCartItem>>, TError, {
        itemId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof removeCartItem>>, TError, {
    itemId: number;
}, TContext>;
export declare const getClearCartUrl: () => string;
/**
 * @summary Clear entire cart
 */
export declare const clearCart: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getClearCartMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearCart>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof clearCart>>, TError, void, TContext>;
export type ClearCartMutationResult = NonNullable<Awaited<ReturnType<typeof clearCart>>>;
export type ClearCartMutationError = ErrorType<unknown>;
/**
* @summary Clear entire cart
*/
export declare const useClearCart: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof clearCart>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof clearCart>>, TError, void, TContext>;
export declare const getGetOrdersUrl: (params?: GetOrdersParams) => string;
/**
 * @summary List orders for current user
 */
export declare const getOrders: (params?: GetOrdersParams, options?: RequestInit) => Promise<Order[]>;
export declare const getGetOrdersQueryKey: (params?: GetOrdersParams) => readonly ["/api/orders", ...GetOrdersParams[]];
export declare const getGetOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getOrders>>, TError = ErrorType<unknown>>(params?: GetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getOrders>>>;
export type GetOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List orders for current user
 */
export declare function useGetOrders<TData = Awaited<ReturnType<typeof getOrders>>, TError = ErrorType<unknown>>(params?: GetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
/**
 * @summary Create order from cart or direct purchase
 */
export declare const createOrder: (orderInput: OrderInput, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<OrderInput>;
export type CreateOrderMutationError = ErrorType<unknown>;
/**
* @summary Create order from cart or direct purchase
*/
export declare const useCreateOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getGetOrderUrl: (orderId: number) => string;
/**
 * @summary Get order detail
 */
export declare const getOrder: (orderId: number, options?: RequestInit) => Promise<Order>;
export declare const getGetOrderQueryKey: (orderId: number) => readonly [`/api/orders/${number}`];
export declare const getGetOrderQueryOptions: <TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<ErrorResponse>>(orderId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getOrder>>>;
export type GetOrderQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get order detail
 */
export declare function useGetOrder<TData = Awaited<ReturnType<typeof getOrder>>, TError = ErrorType<ErrorResponse>>(orderId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateOrderStatusUrl: (orderId: number) => string;
/**
 * @summary Update order status (confirm, ship, deliver, complete, cancel)
 */
export declare const updateOrderStatus: (orderId: number, orderStatusUpdate: OrderStatusUpdate, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        orderId: number;
        data: BodyType<OrderStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    orderId: number;
    data: BodyType<OrderStatusUpdate>;
}, TContext>;
export type UpdateOrderStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrderStatus>>>;
export type UpdateOrderStatusMutationBody = BodyType<OrderStatusUpdate>;
export type UpdateOrderStatusMutationError = ErrorType<unknown>;
/**
* @summary Update order status (confirm, ship, deliver, complete, cancel)
*/
export declare const useUpdateOrderStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        orderId: number;
        data: BodyType<OrderStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    orderId: number;
    data: BodyType<OrderStatusUpdate>;
}, TContext>;
export declare const getConfirmOrderReceivedUrl: (orderId: number) => string;
/**
 * @summary Buyer confirms receipt — triggers escrow release
 */
export declare const confirmOrderReceived: (orderId: number, options?: RequestInit) => Promise<Order>;
export declare const getConfirmOrderReceivedMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmOrderReceived>>, TError, {
        orderId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof confirmOrderReceived>>, TError, {
    orderId: number;
}, TContext>;
export type ConfirmOrderReceivedMutationResult = NonNullable<Awaited<ReturnType<typeof confirmOrderReceived>>>;
export type ConfirmOrderReceivedMutationError = ErrorType<unknown>;
/**
* @summary Buyer confirms receipt — triggers escrow release
*/
export declare const useConfirmOrderReceived: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof confirmOrderReceived>>, TError, {
        orderId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof confirmOrderReceived>>, TError, {
    orderId: number;
}, TContext>;
export declare const getOpenDisputeUrl: (orderId: number) => string;
/**
 * @summary Open a dispute for an order
 */
export declare const openDispute: (orderId: number, disputeInput: DisputeInput, options?: RequestInit) => Promise<Order>;
export declare const getOpenDisputeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof openDispute>>, TError, {
        orderId: number;
        data: BodyType<DisputeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof openDispute>>, TError, {
    orderId: number;
    data: BodyType<DisputeInput>;
}, TContext>;
export type OpenDisputeMutationResult = NonNullable<Awaited<ReturnType<typeof openDispute>>>;
export type OpenDisputeMutationBody = BodyType<DisputeInput>;
export type OpenDisputeMutationError = ErrorType<unknown>;
/**
* @summary Open a dispute for an order
*/
export declare const useOpenDispute: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof openDispute>>, TError, {
        orderId: number;
        data: BodyType<DisputeInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof openDispute>>, TError, {
    orderId: number;
    data: BodyType<DisputeInput>;
}, TContext>;
export declare const getGetEscrowAccountsUrl: () => string;
/**
 * @summary Get escrow account balances
 */
export declare const getEscrowAccounts: (options?: RequestInit) => Promise<EscrowAccount[]>;
export declare const getGetEscrowAccountsQueryKey: () => readonly ["/api/payments/escrow"];
export declare const getGetEscrowAccountsQueryOptions: <TData = Awaited<ReturnType<typeof getEscrowAccounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEscrowAccounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEscrowAccounts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEscrowAccountsQueryResult = NonNullable<Awaited<ReturnType<typeof getEscrowAccounts>>>;
export type GetEscrowAccountsQueryError = ErrorType<unknown>;
/**
 * @summary Get escrow account balances
 */
export declare function useGetEscrowAccounts<TData = Awaited<ReturnType<typeof getEscrowAccounts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEscrowAccounts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetWalletUrl: () => string;
/**
 * @summary Get user's wallet balance and transaction history
 */
export declare const getWallet: (options?: RequestInit) => Promise<Wallet>;
export declare const getGetWalletQueryKey: () => readonly ["/api/payments/wallet"];
export declare const getGetWalletQueryOptions: <TData = Awaited<ReturnType<typeof getWallet>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetWalletQueryResult = NonNullable<Awaited<ReturnType<typeof getWallet>>>;
export type GetWalletQueryError = ErrorType<unknown>;
/**
 * @summary Get user's wallet balance and transaction history
 */
export declare function useGetWallet<TData = Awaited<ReturnType<typeof getWallet>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getWallet>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRequestWithdrawalUrl: () => string;
/**
 * @summary Request withdrawal from wallet to bank
 */
export declare const requestWithdrawal: (withdrawalInput: WithdrawalInput, options?: RequestInit) => Promise<Transaction>;
export declare const getRequestWithdrawalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestWithdrawal>>, TError, {
        data: BodyType<WithdrawalInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof requestWithdrawal>>, TError, {
    data: BodyType<WithdrawalInput>;
}, TContext>;
export type RequestWithdrawalMutationResult = NonNullable<Awaited<ReturnType<typeof requestWithdrawal>>>;
export type RequestWithdrawalMutationBody = BodyType<WithdrawalInput>;
export type RequestWithdrawalMutationError = ErrorType<unknown>;
/**
* @summary Request withdrawal from wallet to bank
*/
export declare const useRequestWithdrawal: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestWithdrawal>>, TError, {
        data: BodyType<WithdrawalInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof requestWithdrawal>>, TError, {
    data: BodyType<WithdrawalInput>;
}, TContext>;
export declare const getGetCouriersUrl: () => string;
/**
 * @summary List available courier partners
 */
export declare const getCouriers: (options?: RequestInit) => Promise<Courier[]>;
export declare const getGetCouriersQueryKey: () => readonly ["/api/shipping/couriers"];
export declare const getGetCouriersQueryOptions: <TData = Awaited<ReturnType<typeof getCouriers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCouriers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCouriers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCouriersQueryResult = NonNullable<Awaited<ReturnType<typeof getCouriers>>>;
export type GetCouriersQueryError = ErrorType<unknown>;
/**
 * @summary List available courier partners
 */
export declare function useGetCouriers<TData = Awaited<ReturnType<typeof getCouriers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCouriers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCalculateShippingUrl: () => string;
/**
 * @summary Calculate shipping cost between locations
 */
export declare const calculateShipping: (shippingCalculateInput: ShippingCalculateInput, options?: RequestInit) => Promise<ShippingOption[]>;
export declare const getCalculateShippingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateShipping>>, TError, {
        data: BodyType<ShippingCalculateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof calculateShipping>>, TError, {
    data: BodyType<ShippingCalculateInput>;
}, TContext>;
export type CalculateShippingMutationResult = NonNullable<Awaited<ReturnType<typeof calculateShipping>>>;
export type CalculateShippingMutationBody = BodyType<ShippingCalculateInput>;
export type CalculateShippingMutationError = ErrorType<unknown>;
/**
* @summary Calculate shipping cost between locations
*/
export declare const useCalculateShipping: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof calculateShipping>>, TError, {
        data: BodyType<ShippingCalculateInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof calculateShipping>>, TError, {
    data: BodyType<ShippingCalculateInput>;
}, TContext>;
export declare const getTrackShipmentUrl: (trackingNumber: string) => string;
/**
 * @summary Track shipment by tracking number
 */
export declare const trackShipment: (trackingNumber: string, options?: RequestInit) => Promise<TrackingInfo>;
export declare const getTrackShipmentQueryKey: (trackingNumber: string) => readonly [`/api/shipping/track/${string}`];
export declare const getTrackShipmentQueryOptions: <TData = Awaited<ReturnType<typeof trackShipment>>, TError = ErrorType<unknown>>(trackingNumber: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof trackShipment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof trackShipment>>, TError, TData> & {
    queryKey: QueryKey;
};
export type TrackShipmentQueryResult = NonNullable<Awaited<ReturnType<typeof trackShipment>>>;
export type TrackShipmentQueryError = ErrorType<unknown>;
/**
 * @summary Track shipment by tracking number
 */
export declare function useTrackShipment<TData = Awaited<ReturnType<typeof trackShipment>>, TError = ErrorType<unknown>>(trackingNumber: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof trackShipment>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetShippingCitiesUrl: (params?: GetShippingCitiesParams) => string;
/**
 * @summary Get list of cities (RajaOngkir)
 */
export declare const getShippingCities: (params?: GetShippingCitiesParams, options?: RequestInit) => Promise<GetShippingCities200Item[]>;
export declare const getGetShippingCitiesQueryKey: (params?: GetShippingCitiesParams) => readonly ["/api/shipping/cities", ...GetShippingCitiesParams[]];
export declare const getGetShippingCitiesQueryOptions: <TData = Awaited<ReturnType<typeof getShippingCities>>, TError = ErrorType<unknown>>(params?: GetShippingCitiesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShippingCities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getShippingCities>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetShippingCitiesQueryResult = NonNullable<Awaited<ReturnType<typeof getShippingCities>>>;
export type GetShippingCitiesQueryError = ErrorType<unknown>;
/**
 * @summary Get list of cities (RajaOngkir)
 */
export declare function useGetShippingCities<TData = Awaited<ReturnType<typeof getShippingCities>>, TError = ErrorType<unknown>>(params?: GetShippingCitiesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShippingCities>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetShippingProvincesUrl: () => string;
/**
 * @summary Get list of provinces (RajaOngkir)
 */
export declare const getShippingProvinces: (options?: RequestInit) => Promise<GetShippingProvinces200Item[]>;
export declare const getGetShippingProvincesQueryKey: () => readonly ["/api/shipping/provinces"];
export declare const getGetShippingProvincesQueryOptions: <TData = Awaited<ReturnType<typeof getShippingProvinces>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShippingProvinces>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getShippingProvinces>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetShippingProvincesQueryResult = NonNullable<Awaited<ReturnType<typeof getShippingProvinces>>>;
export type GetShippingProvincesQueryError = ErrorType<unknown>;
/**
 * @summary Get list of provinces (RajaOngkir)
 */
export declare function useGetShippingProvinces<TData = Awaited<ReturnType<typeof getShippingProvinces>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getShippingProvinces>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRequestUploadUrlUrl: () => string;
/**
 * @summary Request presigned URL for direct file upload to GCS
 */
export declare const requestUploadUrl: (requestUploadUrlBody: RequestUploadUrlBody, options?: RequestInit) => Promise<RequestUploadUrlResponse>;
export declare const getRequestUploadUrlMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<RequestUploadUrlBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<RequestUploadUrlBody>;
}, TContext>;
export type RequestUploadUrlMutationResult = NonNullable<Awaited<ReturnType<typeof requestUploadUrl>>>;
export type RequestUploadUrlMutationBody = BodyType<RequestUploadUrlBody>;
export type RequestUploadUrlMutationError = ErrorType<unknown>;
/**
* @summary Request presigned URL for direct file upload to GCS
*/
export declare const useRequestUploadUrl: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
        data: BodyType<RequestUploadUrlBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof requestUploadUrl>>, TError, {
    data: BodyType<RequestUploadUrlBody>;
}, TContext>;
export declare const getGetStorageObjectUrl: (objectPath: string) => string;
/**
 * @summary Serve stored object
 */
export declare const getStorageObject: (objectPath: string, options?: RequestInit) => Promise<void>;
export declare const getGetStorageObjectQueryKey: (objectPath: string) => readonly [`/api/storage/objects/${string}`];
export declare const getGetStorageObjectQueryOptions: <TData = Awaited<ReturnType<typeof getStorageObject>>, TError = ErrorType<unknown>>(objectPath: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStorageObject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStorageObject>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStorageObjectQueryResult = NonNullable<Awaited<ReturnType<typeof getStorageObject>>>;
export type GetStorageObjectQueryError = ErrorType<unknown>;
/**
 * @summary Serve stored object
 */
export declare function useGetStorageObject<TData = Awaited<ReturnType<typeof getStorageObject>>, TError = ErrorType<unknown>>(objectPath: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStorageObject>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMidtransTokenUrl: () => string;
/**
 * @summary Get Midtrans Snap token for an order
 */
export declare const getMidtransToken: (getMidtransTokenBody: GetMidtransTokenBody, options?: RequestInit) => Promise<GetMidtransToken200>;
export declare const getGetMidtransTokenMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof getMidtransToken>>, TError, {
        data: BodyType<GetMidtransTokenBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof getMidtransToken>>, TError, {
    data: BodyType<GetMidtransTokenBody>;
}, TContext>;
export type GetMidtransTokenMutationResult = NonNullable<Awaited<ReturnType<typeof getMidtransToken>>>;
export type GetMidtransTokenMutationBody = BodyType<GetMidtransTokenBody>;
export type GetMidtransTokenMutationError = ErrorType<unknown>;
/**
* @summary Get Midtrans Snap token for an order
*/
export declare const useGetMidtransToken: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof getMidtransToken>>, TError, {
        data: BodyType<GetMidtransTokenBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof getMidtransToken>>, TError, {
    data: BodyType<GetMidtransTokenBody>;
}, TContext>;
export declare const getMidtransWebhookUrl: () => string;
/**
 * @summary Midtrans payment notification webhook
 */
export declare const midtransWebhook: (options?: RequestInit) => Promise<void>;
export declare const getMidtransWebhookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof midtransWebhook>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof midtransWebhook>>, TError, void, TContext>;
export type MidtransWebhookMutationResult = NonNullable<Awaited<ReturnType<typeof midtransWebhook>>>;
export type MidtransWebhookMutationError = ErrorType<unknown>;
/**
* @summary Midtrans payment notification webhook
*/
export declare const useMidtransWebhook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof midtransWebhook>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof midtransWebhook>>, TError, void, TContext>;
export declare const getGetMidtransConfigUrl: () => string;
/**
 * @summary Get Midtrans client-side configuration
 */
export declare const getMidtransConfig: (options?: RequestInit) => Promise<GetMidtransConfig200>;
export declare const getGetMidtransConfigQueryKey: () => readonly ["/api/payments/midtrans/config"];
export declare const getGetMidtransConfigQueryOptions: <TData = Awaited<ReturnType<typeof getMidtransConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMidtransConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMidtransConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMidtransConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getMidtransConfig>>>;
export type GetMidtransConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get Midtrans client-side configuration
 */
export declare function useGetMidtransConfig<TData = Awaited<ReturnType<typeof getMidtransConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMidtransConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetConversationsUrl: () => string;
/**
 * @summary List all conversations
 */
export declare const getConversations: (options?: RequestInit) => Promise<Conversation[]>;
export declare const getGetConversationsQueryKey: () => readonly ["/api/messages/conversations"];
export declare const getGetConversationsQueryOptions: <TData = Awaited<ReturnType<typeof getConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getConversations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetConversationsQueryResult = NonNullable<Awaited<ReturnType<typeof getConversations>>>;
export type GetConversationsQueryError = ErrorType<unknown>;
/**
 * @summary List all conversations
 */
export declare function useGetConversations<TData = Awaited<ReturnType<typeof getConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getStartConversationUrl: () => string;
/**
 * @summary Start a new conversation
 */
export declare const startConversation: (conversationInput: ConversationInput, options?: RequestInit) => Promise<Conversation>;
export declare const getStartConversationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startConversation>>, TError, {
        data: BodyType<ConversationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof startConversation>>, TError, {
    data: BodyType<ConversationInput>;
}, TContext>;
export type StartConversationMutationResult = NonNullable<Awaited<ReturnType<typeof startConversation>>>;
export type StartConversationMutationBody = BodyType<ConversationInput>;
export type StartConversationMutationError = ErrorType<unknown>;
/**
* @summary Start a new conversation
*/
export declare const useStartConversation: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof startConversation>>, TError, {
        data: BodyType<ConversationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof startConversation>>, TError, {
    data: BodyType<ConversationInput>;
}, TContext>;
export declare const getGetMessagesUrl: (conversationId: number) => string;
/**
 * @summary Get messages in a conversation
 */
export declare const getMessages: (conversationId: number, options?: RequestInit) => Promise<Message[]>;
export declare const getGetMessagesQueryKey: (conversationId: number) => readonly [`/api/messages/conversations/${number}`];
export declare const getGetMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getMessages>>, TError = ErrorType<unknown>>(conversationId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getMessages>>>;
export type GetMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages in a conversation
 */
export declare function useGetMessages<TData = Awaited<ReturnType<typeof getMessages>>, TError = ErrorType<unknown>>(conversationId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSendMessageUrl: (conversationId: number) => string;
/**
 * @summary Send a message in a conversation
 */
export declare const sendMessage: (conversationId: number, messageInput: MessageInput, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        conversationId: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    conversationId: number;
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a message in a conversation
*/
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        conversationId: number;
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    conversationId: number;
    data: BodyType<MessageInput>;
}, TContext>;
export declare const getGetNotificationsUrl: () => string;
/**
 * @summary Get user notifications
 */
export declare const getNotifications: (options?: RequestInit) => Promise<Notification[]>;
export declare const getGetNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getGetNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof getNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof getNotifications>>>;
export type GetNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary Get user notifications
 */
export declare function useGetNotifications<TData = Awaited<ReturnType<typeof getNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkNotificationReadUrl: (notificationId: number) => string;
/**
 * @summary Mark notification as read
 */
export declare const markNotificationRead: (notificationId: number, options?: RequestInit) => Promise<SuccessResponse>;
export declare const getMarkNotificationReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        notificationId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    notificationId: number;
}, TContext>;
export type MarkNotificationReadMutationResult = NonNullable<Awaited<ReturnType<typeof markNotificationRead>>>;
export type MarkNotificationReadMutationError = ErrorType<unknown>;
/**
* @summary Mark notification as read
*/
export declare const useMarkNotificationRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
        notificationId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markNotificationRead>>, TError, {
    notificationId: number;
}, TContext>;
export declare const getMarkAllNotificationsReadUrl: () => string;
/**
 * @summary Mark all notifications as read
 */
export declare const markAllNotificationsRead: (options?: RequestInit) => Promise<SuccessResponse>;
export declare const getMarkAllNotificationsReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export type MarkAllNotificationsReadMutationResult = NonNullable<Awaited<ReturnType<typeof markAllNotificationsRead>>>;
export type MarkAllNotificationsReadMutationError = ErrorType<unknown>;
/**
* @summary Mark all notifications as read
*/
export declare const useMarkAllNotificationsRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export declare const getGetReportsUrl: (params?: GetReportsParams) => string;
/**
 * @summary List fraud/spam reports (admin only)
 */
export declare const getReports: (params?: GetReportsParams, options?: RequestInit) => Promise<Report[]>;
export declare const getGetReportsQueryKey: (params?: GetReportsParams) => readonly ["/api/reports", ...GetReportsParams[]];
export declare const getGetReportsQueryOptions: <TData = Awaited<ReturnType<typeof getReports>>, TError = ErrorType<unknown>>(params?: GetReportsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReports>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReportsQueryResult = NonNullable<Awaited<ReturnType<typeof getReports>>>;
export type GetReportsQueryError = ErrorType<unknown>;
/**
 * @summary List fraud/spam reports (admin only)
 */
export declare function useGetReports<TData = Awaited<ReturnType<typeof getReports>>, TError = ErrorType<unknown>>(params?: GetReportsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReports>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSubmitReportUrl: () => string;
/**
 * @summary Submit a fraud/spam report
 */
export declare const submitReport: (reportInput: ReportInput, options?: RequestInit) => Promise<Report>;
export declare const getSubmitReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitReport>>, TError, {
        data: BodyType<ReportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof submitReport>>, TError, {
    data: BodyType<ReportInput>;
}, TContext>;
export type SubmitReportMutationResult = NonNullable<Awaited<ReturnType<typeof submitReport>>>;
export type SubmitReportMutationBody = BodyType<ReportInput>;
export type SubmitReportMutationError = ErrorType<unknown>;
/**
* @summary Submit a fraud/spam report
*/
export declare const useSubmitReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof submitReport>>, TError, {
        data: BodyType<ReportInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof submitReport>>, TError, {
    data: BodyType<ReportInput>;
}, TContext>;
export declare const getResolveReportUrl: (reportId: number) => string;
/**
 * @summary Resolve or dismiss a report (admin only)
 */
export declare const resolveReport: (reportId: number, reportResolution: ReportResolution, options?: RequestInit) => Promise<Report>;
export declare const getResolveReportMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveReport>>, TError, {
        reportId: number;
        data: BodyType<ReportResolution>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resolveReport>>, TError, {
    reportId: number;
    data: BodyType<ReportResolution>;
}, TContext>;
export type ResolveReportMutationResult = NonNullable<Awaited<ReturnType<typeof resolveReport>>>;
export type ResolveReportMutationBody = BodyType<ReportResolution>;
export type ResolveReportMutationError = ErrorType<unknown>;
/**
* @summary Resolve or dismiss a report (admin only)
*/
export declare const useResolveReport: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveReport>>, TError, {
        reportId: number;
        data: BodyType<ReportResolution>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resolveReport>>, TError, {
    reportId: number;
    data: BodyType<ReportResolution>;
}, TContext>;
export declare const getAdminGetUsersUrl: (params?: AdminGetUsersParams) => string;
/**
 * @summary Admin — list all users
 */
export declare const adminGetUsers: (params?: AdminGetUsersParams, options?: RequestInit) => Promise<AdminUserPage>;
export declare const getAdminGetUsersQueryKey: (params?: AdminGetUsersParams) => readonly ["/api/admin/users", ...AdminGetUsersParams[]];
export declare const getAdminGetUsersQueryOptions: <TData = Awaited<ReturnType<typeof adminGetUsers>>, TError = ErrorType<unknown>>(params?: AdminGetUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetUsersQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetUsers>>>;
export type AdminGetUsersQueryError = ErrorType<unknown>;
/**
 * @summary Admin — list all users
 */
export declare function useAdminGetUsers<TData = Awaited<ReturnType<typeof adminGetUsers>>, TError = ErrorType<unknown>>(params?: AdminGetUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminUpdateUserStatusUrl: (userId: number) => string;
/**
 * @summary Admin — suspend or ban a user
 */
export declare const adminUpdateUserStatus: (userId: number, adminUserStatusUpdate: AdminUserStatusUpdate, options?: RequestInit) => Promise<User>;
export declare const getAdminUpdateUserStatusMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUserStatus>>, TError, {
        userId: number;
        data: BodyType<AdminUserStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUserStatus>>, TError, {
    userId: number;
    data: BodyType<AdminUserStatusUpdate>;
}, TContext>;
export type AdminUpdateUserStatusMutationResult = NonNullable<Awaited<ReturnType<typeof adminUpdateUserStatus>>>;
export type AdminUpdateUserStatusMutationBody = BodyType<AdminUserStatusUpdate>;
export type AdminUpdateUserStatusMutationError = ErrorType<unknown>;
/**
* @summary Admin — suspend or ban a user
*/
export declare const useAdminUpdateUserStatus: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminUpdateUserStatus>>, TError, {
        userId: number;
        data: BodyType<AdminUserStatusUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminUpdateUserStatus>>, TError, {
    userId: number;
    data: BodyType<AdminUserStatusUpdate>;
}, TContext>;
export declare const getAdminGetProductsUrl: (params?: AdminGetProductsParams) => string;
/**
 * @summary Admin — list all products with moderation status
 */
export declare const adminGetProducts: (params?: AdminGetProductsParams, options?: RequestInit) => Promise<Product[]>;
export declare const getAdminGetProductsQueryKey: (params?: AdminGetProductsParams) => readonly ["/api/admin/products", ...AdminGetProductsParams[]];
export declare const getAdminGetProductsQueryOptions: <TData = Awaited<ReturnType<typeof adminGetProducts>>, TError = ErrorType<unknown>>(params?: AdminGetProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetProducts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetProductsQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetProducts>>>;
export type AdminGetProductsQueryError = ErrorType<unknown>;
/**
 * @summary Admin — list all products with moderation status
 */
export declare function useAdminGetProducts<TData = Awaited<ReturnType<typeof adminGetProducts>>, TError = ErrorType<unknown>>(params?: AdminGetProductsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetProducts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminModerateProductUrl: (productId: number) => string;
/**
 * @summary Admin — approve or remove a product
 */
export declare const adminModerateProduct: (productId: number, productModerationInput: ProductModerationInput, options?: RequestInit) => Promise<Product>;
export declare const getAdminModerateProductMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminModerateProduct>>, TError, {
        productId: number;
        data: BodyType<ProductModerationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminModerateProduct>>, TError, {
    productId: number;
    data: BodyType<ProductModerationInput>;
}, TContext>;
export type AdminModerateProductMutationResult = NonNullable<Awaited<ReturnType<typeof adminModerateProduct>>>;
export type AdminModerateProductMutationBody = BodyType<ProductModerationInput>;
export type AdminModerateProductMutationError = ErrorType<unknown>;
/**
* @summary Admin — approve or remove a product
*/
export declare const useAdminModerateProduct: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminModerateProduct>>, TError, {
        productId: number;
        data: BodyType<ProductModerationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminModerateProduct>>, TError, {
    productId: number;
    data: BodyType<ProductModerationInput>;
}, TContext>;
export declare const getAdminGetOrdersUrl: (params?: AdminGetOrdersParams) => string;
/**
 * @summary Admin — list all orders
 */
export declare const adminGetOrders: (params?: AdminGetOrdersParams, options?: RequestInit) => Promise<Order[]>;
export declare const getAdminGetOrdersQueryKey: (params?: AdminGetOrdersParams) => readonly ["/api/admin/orders", ...AdminGetOrdersParams[]];
export declare const getAdminGetOrdersQueryOptions: <TData = Awaited<ReturnType<typeof adminGetOrders>>, TError = ErrorType<unknown>>(params?: AdminGetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetOrders>>>;
export type AdminGetOrdersQueryError = ErrorType<unknown>;
/**
 * @summary Admin — list all orders
 */
export declare function useAdminGetOrders<TData = Awaited<ReturnType<typeof adminGetOrders>>, TError = ErrorType<unknown>>(params?: AdminGetOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminGetDisputesUrl: () => string;
/**
 * @summary Admin — list all open disputes
 */
export declare const adminGetDisputes: (options?: RequestInit) => Promise<Dispute[]>;
export declare const getAdminGetDisputesQueryKey: () => readonly ["/api/admin/disputes"];
export declare const getAdminGetDisputesQueryOptions: <TData = Awaited<ReturnType<typeof adminGetDisputes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetDisputes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetDisputes>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetDisputesQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetDisputes>>>;
export type AdminGetDisputesQueryError = ErrorType<unknown>;
/**
 * @summary Admin — list all open disputes
 */
export declare function useAdminGetDisputes<TData = Awaited<ReturnType<typeof adminGetDisputes>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetDisputes>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminResolveDisputeUrl: (disputeId: number) => string;
/**
 * @summary Admin — resolve a dispute with ruling
 */
export declare const adminResolveDispute: (disputeId: number, disputeResolution: DisputeResolution, options?: RequestInit) => Promise<Dispute>;
export declare const getAdminResolveDisputeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminResolveDispute>>, TError, {
        disputeId: number;
        data: BodyType<DisputeResolution>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminResolveDispute>>, TError, {
    disputeId: number;
    data: BodyType<DisputeResolution>;
}, TContext>;
export type AdminResolveDisputeMutationResult = NonNullable<Awaited<ReturnType<typeof adminResolveDispute>>>;
export type AdminResolveDisputeMutationBody = BodyType<DisputeResolution>;
export type AdminResolveDisputeMutationError = ErrorType<unknown>;
/**
* @summary Admin — resolve a dispute with ruling
*/
export declare const useAdminResolveDispute: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminResolveDispute>>, TError, {
        disputeId: number;
        data: BodyType<DisputeResolution>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminResolveDispute>>, TError, {
    disputeId: number;
    data: BodyType<DisputeResolution>;
}, TContext>;
export declare const getAdminGetWithdrawalsUrl: (params?: AdminGetWithdrawalsParams) => string;
/**
 * @summary Admin — list withdrawal requests
 */
export declare const adminGetWithdrawals: (params?: AdminGetWithdrawalsParams, options?: RequestInit) => Promise<Transaction[]>;
export declare const getAdminGetWithdrawalsQueryKey: (params?: AdminGetWithdrawalsParams) => readonly ["/api/admin/withdrawals", ...AdminGetWithdrawalsParams[]];
export declare const getAdminGetWithdrawalsQueryOptions: <TData = Awaited<ReturnType<typeof adminGetWithdrawals>>, TError = ErrorType<unknown>>(params?: AdminGetWithdrawalsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetWithdrawals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof adminGetWithdrawals>>, TError, TData> & {
    queryKey: QueryKey;
};
export type AdminGetWithdrawalsQueryResult = NonNullable<Awaited<ReturnType<typeof adminGetWithdrawals>>>;
export type AdminGetWithdrawalsQueryError = ErrorType<unknown>;
/**
 * @summary Admin — list withdrawal requests
 */
export declare function useAdminGetWithdrawals<TData = Awaited<ReturnType<typeof adminGetWithdrawals>>, TError = ErrorType<unknown>>(params?: AdminGetWithdrawalsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof adminGetWithdrawals>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminProcessWithdrawalUrl: (withdrawalId: number) => string;
/**
 * @summary Admin — approve or reject a withdrawal
 */
export declare const adminProcessWithdrawal: (withdrawalId: number, withdrawalProcess: WithdrawalProcess, options?: RequestInit) => Promise<Transaction>;
export declare const getAdminProcessWithdrawalMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminProcessWithdrawal>>, TError, {
        withdrawalId: number;
        data: BodyType<WithdrawalProcess>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminProcessWithdrawal>>, TError, {
    withdrawalId: number;
    data: BodyType<WithdrawalProcess>;
}, TContext>;
export type AdminProcessWithdrawalMutationResult = NonNullable<Awaited<ReturnType<typeof adminProcessWithdrawal>>>;
export type AdminProcessWithdrawalMutationBody = BodyType<WithdrawalProcess>;
export type AdminProcessWithdrawalMutationError = ErrorType<unknown>;
/**
* @summary Admin — approve or reject a withdrawal
*/
export declare const useAdminProcessWithdrawal: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminProcessWithdrawal>>, TError, {
        withdrawalId: number;
        data: BodyType<WithdrawalProcess>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminProcessWithdrawal>>, TError, {
    withdrawalId: number;
    data: BodyType<WithdrawalProcess>;
}, TContext>;
export declare const getGetDashboardSummaryUrl: () => string;
/**
 * @summary Get dashboard summary (orders, sales, revenue) for current user
 */
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/dashboard/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard summary (orders, sales, revenue) for current user
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminDashboardSummaryUrl: () => string;
/**
 * @summary Admin — platform-wide statistics
 */
export declare const getAdminDashboardSummary: (options?: RequestInit) => Promise<AdminDashboardSummary>;
export declare const getGetAdminDashboardSummaryQueryKey: () => readonly ["/api/dashboard/admin-summary"];
export declare const getGetAdminDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getAdminDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminDashboardSummary>>>;
export type GetAdminDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Admin — platform-wide statistics
 */
export declare function useGetAdminDashboardSummary<TData = Awaited<ReturnType<typeof getAdminDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRecentActivityUrl: () => string;
/**
 * @summary Recent activity feed (orders, reviews, messages)
 */
export declare const getRecentActivity: (options?: RequestInit) => Promise<ActivityItem[]>;
export declare const getGetRecentActivityQueryKey: () => readonly ["/api/dashboard/recent-activity"];
export declare const getGetRecentActivityQueryOptions: <TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRecentActivityQueryResult = NonNullable<Awaited<ReturnType<typeof getRecentActivity>>>;
export type GetRecentActivityQueryError = ErrorType<unknown>;
/**
 * @summary Recent activity feed (orders, reviews, messages)
 */
export declare function useGetRecentActivity<TData = Awaited<ReturnType<typeof getRecentActivity>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRecentActivity>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSalesChartUrl: (params?: GetSalesChartParams) => string;
/**
 * @summary Sales over time for seller dashboard
 */
export declare const getSalesChart: (params?: GetSalesChartParams, options?: RequestInit) => Promise<ChartPoint[]>;
export declare const getGetSalesChartQueryKey: (params?: GetSalesChartParams) => readonly ["/api/dashboard/sales-chart", ...GetSalesChartParams[]];
export declare const getGetSalesChartQueryOptions: <TData = Awaited<ReturnType<typeof getSalesChart>>, TError = ErrorType<unknown>>(params?: GetSalesChartParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSalesChartQueryResult = NonNullable<Awaited<ReturnType<typeof getSalesChart>>>;
export type GetSalesChartQueryError = ErrorType<unknown>;
/**
 * @summary Sales over time for seller dashboard
 */
export declare function useGetSalesChart<TData = Awaited<ReturnType<typeof getSalesChart>>, TError = ErrorType<unknown>>(params?: GetSalesChartParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSalesChart>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map