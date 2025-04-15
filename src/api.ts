import { newOrder, OrderResponse, SingleProductResponse, ProductResponse } from './types';


export const getAllProducts = async (): Promise<ProductResponse> => {
    const response = await fetch('https://www.bortakvall.se/api/v2/products/');
    if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
    }
    return response.json();
};

export const getSingleProduct = async (id: number): Promise<SingleProductResponse> => {
    const response = await fetch(`https://www.bortakvall.se/api/v2/products/${id}`);
    if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
    }
    return response.json();
};

export const completeOrder = async (newOrder: newOrder): Promise<OrderResponse> => {
	const res = await fetch("https://www.bortakvall.se/api/v2/users/63/orders", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newOrder),
	});
	if (!res.ok) {
		throw new Error(`Could not complete order. Status: ${res.status} ${res.statusText}`);
	}

	const data: OrderResponse = await res.json();

	return data;
}
