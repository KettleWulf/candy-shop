
export interface OrderItem {
    product_id: number,
    qty: number,
    item_price: number,
    item_total: number
}

export interface ResponseItem {
    order_id: number
}


export interface newOrder {
    customer_first_name: string,
    customer_last_name: string,
    customer_address: string,
    customer_postcode: string,
    customer_city: string,
    customer_email: string,
    customer_phone?: string,
    order_total: number,
    order_items: OrderItem[]
}


export interface OrderResponse {
    status: string,
    data: {
        id: number,
        user_id: number,
        order_date: string,
        customer_first_name: string,
        customer_last_name: string,
        customer_adress: string,
        customer_postcode: string,
        customer_city: string,
        customer_email: string,
        customer_phone: string,
        order_total: number,
        created_at: string,
        updated_at: string
        items: ResponseItem[]
    }
}

export interface SingleProductResponse {
    data: Product;
}

export interface ProductResponse {
    data: Product[];
}

export interface Product {
    id: number;
    name: string;
    price: number;
    stock_status: string;
    stock_quantity: number;
    images: {
        thumbnail: string;
        large: string;
    };
    description: string;
    tags: Tags[]
}

interface Tags {
    id: number,
    name: string,
    slug: string
}