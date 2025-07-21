import axios from "axios";


export const CanCreateWill = async (sender: string, receiver: string): Promise<{ success: boolean; message: string }> => {
    try {
        const res = await axios.get(`/api/cancreatewill?sender=${sender}&reciver=${receiver}`);
        return res.data;
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            if (err.response?.data) {
                return err.response.data;
            }
        }
        throw err;
    }

}
