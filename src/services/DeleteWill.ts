
import axios from "axios";


export const DeleteWill = async (sender: string, reciver: string): Promise<{ success: boolean; message: string }> => {
    return axios.delete(`/api/deletewill?sender=${sender}&reciver=${reciver}`)
        .then(res => {
            return res.data
        })
        .catch(err => {
            throw err
        })
}