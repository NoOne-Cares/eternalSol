
import axios from "axios";


export const ClaimWill = async (sender: string, reciver: string): Promise<any> => {
    console.log(reciver)
    return axios.get(`/api/claimwill?sender=${sender}&reciver=${reciver}`)

        .then(res => {
            console.log(reciver)
            return res.data
        })
        .catch(err => {
            console.log(reciver)
            throw err
        })
}