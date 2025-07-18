import axios from 'axios'

export const CreateWill = async (message: string,
    sender: string,
    reciver: string,
    duration: number,
    transaction: string,
    amount: number): Promise<any> => {

    return axios.put("/api/createwill", { message, sender, reciver, duration, transaction, amount })
        .then(res => {
            console.log(res.data);
            return res.data;
        })
        .catch(err => {
            console.error('Error:', err);
            throw err;
        });
};