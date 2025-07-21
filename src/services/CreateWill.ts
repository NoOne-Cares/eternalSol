import axios from 'axios'


interface CreateWillResponse {
    success: boolean;
    message: string;
}
export const CreateWill = async (message: string,
    sender: string,
    reciver: string,
    duration: number,
    transaction: string,
    amount: number): Promise<CreateWillResponse> => {

    return axios.put("/api/createwill", { message, sender, reciver, duration, transaction, amount })
        .then(res => {
            return res.data;
        })
        .catch(err => {
            console.error('Error:', err);
            throw err;
        });
};