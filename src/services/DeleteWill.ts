

import axios from "axios"

export const DeleteWill = async (sender: string, reciver: string): Promise<any> => {
    return axios.delete('/api/deletewill', {
        data: {
            sender,
            reciver
        })
        .then(res => {
            return res.data
        })
        .catch(err => {
            throw err
        })
}