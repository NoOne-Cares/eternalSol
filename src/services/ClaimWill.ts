
import axios from 'axios';

export interface WillResponse {
    _id?: string;
    sender?: string;
    reciver?: string;
    message?: string;
    transaction?: string;
    amount?: number;
    duration?: number;
}

export interface TimeDiffResponse {
    timeDiff: number;
}

export const getWillToBeClaimed = async (
    sender: string,
    reciver: string
): Promise<WillResponse | TimeDiffResponse> => {
    const url = `/api/claimwill?sender=${sender}&reciver=${reciver}`;
    try {
        const response = await axios.get(url, { validateStatus: () => true });

        if (response.status === 200) {
            return response.data as WillResponse;
        } else if (response.status === 201) {
            return { timeDiff: response.data };
        } else {
            throw new Error(response.data?.message || 'Unknown error');
        }
    } catch (error) {
        throw error;
    }
};
