import axios from "axios";

export async function getRequest<T>(
	url: string,
	token: string,
	params?: Record<string, unknown>,
): Promise<{ data: T; status: number }> {
	const response = await axios.get(url, {
		headers: { Authorization: `Bearer ${token}` },
		params,
	});

	return { data: response.data, status: response.status };
}

export async function postRequest<T>(
	url: string,
	token: string,
	params?: Record<string, unknown>,
): Promise<{ data: T; status: number }> {
	const response = await axios.post(
		url,
		{ params },
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		},
	);

	return { data: response.data, status: response.status };
}
