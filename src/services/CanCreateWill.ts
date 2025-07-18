import axios from "axios";


export const CanCreateWill = async (sender: string, reciver: string): Promise<any> => {
    return axios.get(`/api/cancreatewill?sender=${sender}&receiver=${reciver}`)
        .then(res => {
            return res.data
        })
        .catch(err => {
            throw err
        })
}